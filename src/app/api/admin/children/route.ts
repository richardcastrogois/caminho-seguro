import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, GuardianRelationship, IdentifierType, UserRole, UserStatus } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  birthDate: z.string().date(),
  guardianName: z.string().trim().min(3).max(120),
  guardianEmail: z.string().trim().email().max(160),
  guardianPassword: z.string().min(8).max(120).optional(),
  institutionPublicId: z.string().trim().min(8).max(200),
  referenceCode: z.string().trim().max(80).optional().default(""),
  identifierType: z.enum(["QR_CODE", "BLE", "NFC"]).default("QR_CODE"),
  identifierLabel: z.string().trim().max(80).optional().default(""),
});

function publicHelpUrl(request: Request, token: string) {
  const origin = new URL(request.url).origin;
  return `${origin}/ajuda/${encodeURIComponent(token)}`;
}

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["ADMIN"]);
    if (!user) return unauthorizedResponse("Acesso administrativo necessario.");

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: "Dados invalidos para cadastrar a crianca." }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      birthDate,
      guardianName,
      guardianEmail,
      guardianPassword,
      institutionPublicId,
      referenceCode,
      identifierType,
      identifierLabel,
    } = parsedBody.data;

    const institution = await prisma.institution.findUnique({ where: { publicId: institutionPublicId }, select: { id: true } });
    if (!institution) return NextResponse.json({ ok: false, error: "Instituicao nao encontrada." }, { status: 404 });

    const passwordHash = await hashPassword(guardianPassword ?? process.env.DEMO_PASSWORD ?? "CaminhoSeguro@2026");
    const result = await prisma.$transaction(async (transaction) => {
      const guardianUser = await transaction.user.upsert({
        where: { email: guardianEmail.toLowerCase() },
        update: { name: guardianName, role: UserRole.GUARDIAN, status: UserStatus.ACTIVE, passwordHash },
        create: { name: guardianName, email: guardianEmail.toLowerCase(), passwordHash, role: UserRole.GUARDIAN, status: UserStatus.ACTIVE },
      });
      const guardian = await transaction.guardian.upsert({ where: { userId: guardianUser.id }, update: {}, create: { userId: guardianUser.id } });
      await transaction.notificationPreference.upsert({
        where: { guardianId: guardian.id },
        update: { dashboard: true, email: true, browserPush: true },
        create: { guardianId: guardian.id, dashboard: true, email: true, browserPush: true },
      });

      const child = await transaction.child.create({
        data: { firstName, lastName, birthDate: new Date(`${birthDate}T12:00:00.000Z`), status: "ACTIVE" },
        select: { id: true, publicId: true, firstName: true, lastName: true },
      });
      await transaction.childGuardian.create({ data: { childId: child.id, guardianId: guardian.id, relationship: GuardianRelationship.LEGAL_GUARDIAN, isPrimary: true, canReceiveAlerts: true } });
      await transaction.childInstitution.create({ data: { childId: child.id, institutionId: institution.id, referenceCode: referenceCode || null, active: true } });

      const identifier = await transaction.childIdentifier.create({
        data: { childId: child.id, publicToken: `demo-${identifierType.toLowerCase()}-${randomUUID().replaceAll("-", "")}`, type: identifierType as IdentifierType, status: "ACTIVE", label: identifierLabel || null },
        select: { publicToken: true, type: true },
      });
      await transaction.auditLog.create({
        data: { actorUserId: user.id, action: AuditAction.CREATE, entityType: "Child", entityId: child.id, description: "Crianca, responsavel, vinculo institucional e identificador criados pelo painel administrativo.", metadata: { childPublicId: child.publicId, identifierPublicToken: identifier.publicToken } },
      });
      return { child, identifier };
    });

    return NextResponse.json({ ok: true, child: { publicId: result.child.publicId, fullName: `${result.child.firstName} ${result.child.lastName}` }, identifier: { ...result.identifier, publicUrl: publicHelpUrl(request, result.identifier.publicToken) } }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao cadastrar crianca:", error);
    return NextResponse.json({ ok: false, error: "Nao foi possivel cadastrar a crianca." }, { status: 500 });
  }
}
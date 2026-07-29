import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AuditAction,
  InstitutionMemberRole,
  InstitutionType,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  name: z.string().trim().min(3).max(120),
  type: z.enum([
    "SCHOOL",
    "TRANSPORT",
    "PROTECTION_AGENCY",
    "UBS",
    "CRAS",
    "NGO",
    "PARTNER_BUSINESS",
  ]),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
  operatorName: z.string().trim().min(3).max(120).optional().or(z.literal("")),
  operatorEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  operatorPassword: z.string().min(8).max(120).optional(),
});

function memberRoleForType(type: InstitutionType) {
  if (type === "TRANSPORT") return InstitutionMemberRole.MONITOR;
  if (type === "UBS") return InstitutionMemberRole.HEALTH_AGENT;
  if (type === "CRAS") return InstitutionMemberRole.SOCIAL_WORKER;
  if (type === "PROTECTION_AGENCY") return InstitutionMemberRole.PROTECTION_AGENT;
  return InstitutionMemberRole.OPERATOR;
}

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["ADMIN"], request);
    if (!user) return unauthorizedResponse("Acesso administrativo necessario.");

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados invalidos para cadastrar a instituicao." },
        { status: 400 },
      );
    }

    const {
      name,
      type,
      email,
      phone,
      address,
      operatorName,
      operatorEmail,
      operatorPassword,
    } = parsedBody.data;
    const institutionType = type as InstitutionType;
    const accessEmail = (operatorEmail || email || "").trim().toLowerCase();
    const accessName = (operatorName || name).trim();
    const passwordHash = accessEmail
      ? await hashPassword(
          operatorPassword ?? process.env.DEMO_PASSWORD ?? "CaminhoSeguro@2026",
        )
      : null;

    const result = await prisma.$transaction(async (transaction) => {
      const institution = await transaction.institution.create({
        data: {
          name,
          type: institutionType,
          email: email || null,
          phone: phone || null,
          address: address || null,
          active: true,
        },
        select: { id: true, publicId: true, name: true, type: true },
      });

      let accessUser: { email: string; role: UserRole } | null = null;
      if (accessEmail && passwordHash) {
        const role =
          institutionType === "TRANSPORT"
            ? UserRole.TRANSPORT_MEMBER
            : UserRole.INSTITUTION_MEMBER;
        const operator = await transaction.user.upsert({
          where: { email: accessEmail },
          update: { name: accessName, role, status: UserStatus.ACTIVE, passwordHash },
          create: {
            name: accessName,
            email: accessEmail,
            role,
            status: UserStatus.ACTIVE,
            passwordHash,
          },
        });
        await transaction.institutionMember.upsert({
          where: {
            userId_institutionId: { userId: operator.id, institutionId: institution.id },
          },
          update: { role: memberRoleForType(institutionType), active: true },
          create: {
            userId: operator.id,
            institutionId: institution.id,
            role: memberRoleForType(institutionType),
            active: true,
          },
        });
        accessUser = { email: operator.email, role };
      }

      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: AuditAction.CREATE,
          entityType: "Institution",
          entityId: institution.id,
          description: "Instituicao cadastrada pelo painel administrativo.",
          metadata: {
            institutionPublicId: institution.publicId,
            accessEmail: accessUser?.email ?? null,
          },
        },
      });
      return { institution, accessUser };
    });

    return NextResponse.json(
      {
        ok: true,
        institution: {
          publicId: result.institution.publicId,
          name: result.institution.name,
        },
        accessUser: result.accessUser,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao cadastrar instituicao:", error);
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel cadastrar a instituicao." },
      { status: 500 },
    );
  }
}

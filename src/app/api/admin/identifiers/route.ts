import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, IdentifierStatus, IdentifierType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  childPublicId: z.string().min(8).max(200),
  type: z.enum(["QR_CODE", "BLE", "NFC"]),
  label: z.string().trim().max(80).optional().default(""),
});

function publicHelpUrl(request: Request, token: string) {
  const origin = new URL(request.url).origin;
  return `${origin}/ajuda/${encodeURIComponent(token)}`;
}

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["ADMIN"], request);
    if (!user) return unauthorizedResponse("Acesso administrativo necessario.");

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados invalidos para emitir o identificador." },
        { status: 400 },
      );
    }

    const child = await prisma.child.findUnique({
      where: { publicId: parsedBody.data.childPublicId },
      select: { id: true, publicId: true },
    });
    if (!child)
      return NextResponse.json(
        { ok: false, error: "Crianca nao encontrada." },
        { status: 404 },
      );

    const publicToken = `demo-${randomUUID().replaceAll("-", "")}`;
    const identifier = await prisma.$transaction(async (transaction) => {
      const createdIdentifier = await transaction.childIdentifier.create({
        data: {
          childId: child.id,
          publicToken,
          type: parsedBody.data.type as IdentifierType,
          status: IdentifierStatus.ACTIVE,
          label: parsedBody.data.label || null,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: AuditAction.CREATE,
          entityType: "ChildIdentifier",
          entityId: createdIdentifier.id,
          description: "Identificador protegido emitido.",
          metadata: {
            publicToken: createdIdentifier.publicToken,
            type: createdIdentifier.type,
            childPublicId: child.publicId,
          },
        },
      });
      return createdIdentifier;
    });

    return NextResponse.json(
      {
        ok: true,
        identifier: {
          publicToken: identifier.publicToken,
          type: identifier.type,
          publicUrl: publicHelpUrl(request, identifier.publicToken),
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao emitir identificador:", error);
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel emitir o identificador." },
      { status: 500 },
    );
  }
}

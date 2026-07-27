import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, IdentifierStatus, IdentifierType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeDemoRequest } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";
const requestSchema = z.object({
  childPublicId: z.literal(DEMO_CHILD_PUBLIC_ID),
  type: z.enum(["QR_CODE", "BLE", "NFC"]),
  label: z.string().trim().max(80).optional().default(""),
});

export async function POST(request: Request) {
  try {
    if (!(await authorizeDemoRequest(["admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso administrativo necessario." },
        { status: 401 },
      );
    }

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados invÃƒÂ¡lidos para emitir o identificador." },
        { status: 400 },
      );
    }

    const child = await prisma.child.findUnique({
      where: { publicId: DEMO_CHILD_PUBLIC_ID },
      select: { id: true },
    });
    if (!child) {
      return NextResponse.json(
        { ok: false, error: "CrianÃƒÂ§a da demonstraÃƒÂ§ÃƒÂ£o nÃƒÂ£o encontrada." },
        { status: 404 },
      );
    }

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
          action: AuditAction.CREATE,
          entityType: "ChildIdentifier",
          entityId: createdIdentifier.id,
          description:
            "Identificador protegido emitido no ambiente de demonstraÃƒÂ§ÃƒÂ£o.",
          metadata: {
            environment: "demo",
            publicToken: createdIdentifier.publicToken,
            type: createdIdentifier.type,
          },
        },
      });
      return createdIdentifier;
    });

    return NextResponse.json(
      {
        ok: true,
        identifier: { publicToken: identifier.publicToken, type: identifier.type },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao emitir identificador:", error);
    return NextResponse.json(
      { ok: false, error: "NÃƒÂ£o foi possÃƒÂ­vel emitir o identificador." },
      { status: 500 },
    );
  }
}

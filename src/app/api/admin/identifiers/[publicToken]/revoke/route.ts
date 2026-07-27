import { NextResponse } from "next/server";
import { AuditAction, IdentifierStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";

type RouteContext = { params: Promise<{ publicToken: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { publicToken } = await context.params;
    const identifier = await prisma.childIdentifier.findFirst({
      where: { publicToken, child: { publicId: DEMO_CHILD_PUBLIC_ID } },
      select: { id: true, publicToken: true, status: true },
    });

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "Identificador não encontrado no ambiente de demonstração." },
        { status: 404 },
      );
    }
    if (identifier.status !== IdentifierStatus.ACTIVE) {
      return NextResponse.json(
        { ok: false, error: "Este identificador já não está ativo." },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.childIdentifier.update({
        where: { id: identifier.id },
        data: { status: IdentifierStatus.REVOKED, revokedAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          action: AuditAction.REVOKE_IDENTIFIER,
          entityType: "ChildIdentifier",
          entityId: identifier.id,
          description: "Identificador protegido revogado no ambiente de demonstração.",
          metadata: { environment: "demo", publicToken: identifier.publicToken },
        },
      });
    });

    return NextResponse.json({ ok: true, message: "Identificador revogado." });
  } catch (error: unknown) {
    console.error("Erro ao revogar identificador:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível revogar o identificador." },
      { status: 500 },
    );
  }
}

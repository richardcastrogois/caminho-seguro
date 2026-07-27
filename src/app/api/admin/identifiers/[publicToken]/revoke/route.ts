import { NextResponse } from "next/server";
import { AuditAction, IdentifierStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ publicToken: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await authorizeRequest(["ADMIN"], _request);
    if (!user) return unauthorizedResponse("Acesso administrativo necessario.");

    const { publicToken } = await context.params;
    const identifier = await prisma.childIdentifier.findUnique({ where: { publicToken }, select: { id: true, publicToken: true, status: true } });
    if (!identifier) return NextResponse.json({ ok: false, error: "Identificador nao encontrado." }, { status: 404 });
    if (identifier.status !== IdentifierStatus.ACTIVE) {
      return NextResponse.json({ ok: false, error: "Este identificador ja nao esta ativo." }, { status: 409 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.childIdentifier.update({ where: { id: identifier.id }, data: { status: IdentifierStatus.REVOKED, revokedAt: new Date() } });
      await transaction.auditLog.create({
        data: { actorUserId: user.id, action: AuditAction.REVOKE_IDENTIFIER, entityType: "ChildIdentifier", entityId: identifier.id, description: "Identificador protegido revogado.", metadata: { publicToken: identifier.publicToken } },
      });
    });

    return NextResponse.json({ ok: true, message: "Identificador revogado." });
  } catch (error: unknown) {
    console.error("Erro ao revogar identificador:", error);
    return NextResponse.json({ ok: false, error: "Nao foi possivel revogar o identificador." }, { status: 500 });
  }
}
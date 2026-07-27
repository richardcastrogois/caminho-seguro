import { NextResponse } from "next/server";
import { AuditAction, IdentifierStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeDemoRequest } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";

type RouteContext = { params: Promise<{ publicToken: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    if (!(await authorizeDemoRequest(["admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso administrativo necessario." },
        { status: 401 },
      );
    }

    const { publicToken } = await context.params;
    const identifier = await prisma.childIdentifier.findFirst({
      where: { publicToken, child: { publicId: DEMO_CHILD_PUBLIC_ID } },
      select: { id: true, publicToken: true, status: true },
    });

    if (!identifier) {
      return NextResponse.json(
        {
          ok: false,
          error: "Identificador nÃƒÂ£o encontrado no ambiente de demonstraÃƒÂ§ÃƒÂ£o.",
        },
        { status: 404 },
      );
    }
    if (identifier.status !== IdentifierStatus.ACTIVE) {
      return NextResponse.json(
        { ok: false, error: "Este identificador jÃƒÂ¡ nÃƒÂ£o estÃƒÂ¡ ativo." },
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
          description:
            "Identificador protegido revogado no ambiente de demonstraÃƒÂ§ÃƒÂ£o.",
          metadata: { environment: "demo", publicToken: identifier.publicToken },
        },
      });
    });

    return NextResponse.json({ ok: true, message: "Identificador revogado." });
  } catch (error: unknown) {
    console.error("Erro ao revogar identificador:", error);
    return NextResponse.json(
      { ok: false, error: "NÃƒÂ£o foi possÃƒÂ­vel revogar o identificador." },
      { status: 500 },
    );
  }
}

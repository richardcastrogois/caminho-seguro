import { NextResponse } from "next/server";
import { AlertStatus, AuditAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ publicId: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await authorizeRequest(["GUARDIAN", "ADMIN"], _request);
    if (!user) return unauthorizedResponse("Acesso do responsavel necessario.");

    const { publicId } = await context.params;
    const alert = await prisma.alert.findFirst({
      where: {
        publicId,
        ...(user.role === "ADMIN"
          ? {}
          : { child: { guardians: { some: { guardian: { userId: user.id } } } } }),
      },
      select: { id: true, publicId: true, status: true },
    });

    if (!alert) {
      return NextResponse.json(
        { ok: false, error: "Alerta nao encontrado ou acesso nao autorizado." },
        { status: 404 },
      );
    }
    if (alert.status === AlertStatus.RESOLVED) {
      return NextResponse.json({ ok: true, message: "Este alerta ja estava resolvido." });
    }

    const now = new Date();
    await prisma.$transaction(async (transaction) => {
      await transaction.alert.update({
        where: { id: alert.id },
        data: {
          status: AlertStatus.RESOLVED,
          acknowledgedByUserId: user.id,
          acknowledgedAt: now,
          resolvedByUserId: user.id,
          resolvedAt: now,
          resolutionNotes: "Alerta marcado como resolvido pelo responsavel no painel.",
        },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: AuditAction.RESOLVE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: "Responsavel marcou o alerta como resolvido.",
          metadata: { alertPublicId: alert.publicId },
        },
      });
    });

    return NextResponse.json({ ok: true, message: "Alerta resolvido com sucesso." });
  } catch (error: unknown) {
    console.error("Erro ao resolver alerta:", error);
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel resolver o alerta." },
      { status: 500 },
    );
  }
}

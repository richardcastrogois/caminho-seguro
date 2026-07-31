import { NextResponse } from "next/server";
import { AlertStatus, AuditAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ publicId: string }> };

type AlertActionBody = {
  action: "acknowledge" | "resolve";
  notes?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await authorizeRequest(["ADMIN", "PUBLIC_AGENT"], request);
    if (!user) return unauthorizedResponse("Coordenacao autorizada necessaria.");

    let body: AlertActionBody;
    try {
      body = (await request.json()) as AlertActionBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "JSON invalido no corpo da requisicao." },
        { status: 400 },
      );
    }

    if (body.action !== "acknowledge" && body.action !== "resolve") {
      return NextResponse.json(
        { ok: false, error: "Acao invalida. Use acknowledge ou resolve." },
        { status: 400 },
      );
    }

    const { publicId } = await context.params;
    const alert = await prisma.alert.findUnique({
      where: { publicId },
      select: { id: true, publicId: true, status: true },
    });
    if (!alert) {
      return NextResponse.json(
        { ok: false, error: "Alerta nao encontrado." },
        { status: 404 },
      );
    }

    const isAcknowledge = body.action === "acknowledge";
    const resolvableStatuses: AlertStatus[] = [
      AlertStatus.OPEN,
      AlertStatus.ACKNOWLEDGED,
    ];
    if (isAcknowledge && alert.status !== AlertStatus.OPEN) {
      return NextResponse.json(
        { ok: false, error: "Apenas alertas em aberto podem ser assumidos." },
        { status: 409 },
      );
    }
    if (!isAcknowledge && !resolvableStatuses.includes(alert.status)) {
      return NextResponse.json(
        { ok: false, error: "Apenas alertas abertos ou assumidos podem ser resolvidos." },
        { status: 409 },
      );
    }

    const now = new Date();
    await prisma.$transaction(async (transaction) => {
      await transaction.alert.update({
        where: { id: alert.id },
        data: isAcknowledge
          ? {
              status: AlertStatus.ACKNOWLEDGED,
              acknowledgedByUserId: user.id,
              acknowledgedAt: now,
            }
          : {
              status: AlertStatus.RESOLVED,
              resolvedByUserId: user.id,
              resolvedAt: now,
              resolutionNotes: body.notes?.trim() || null,
            },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: isAcknowledge
            ? AuditAction.ACKNOWLEDGE_ALERT
            : AuditAction.RESOLVE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: isAcknowledge
            ? "Alerta assumido pela coordenacao."
            : "Alerta resolvido pela coordenacao.",
          metadata: { publicId: alert.publicId, notes: body.notes?.trim() ?? null },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: isAcknowledge
        ? "Alerta assumido com sucesso."
        : "Alerta resolvido com sucesso.",
      status: isAcknowledge ? AlertStatus.ACKNOWLEDGED : AlertStatus.RESOLVED,
    });
  } catch (error: unknown) {
    console.error("Erro ao atualizar alerta:", error);
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel atualizar o alerta." },
      { status: 500 },
    );
  }
}

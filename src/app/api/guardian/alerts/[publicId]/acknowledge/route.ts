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
      return NextResponse.json(
        { ok: false, error: "Este alerta ja foi resolvido." },
        { status: 409 },
      );
    }
    if (alert.status === AlertStatus.ACKNOWLEDGED) {
      return NextResponse.json({
        ok: true,
        message: "O recebimento deste alerta ja havia sido confirmado.",
      });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.alert.update({
        where: { id: alert.id },
        data: {
          status: AlertStatus.ACKNOWLEDGED,
          acknowledgedByUserId: user.id,
          acknowledgedAt: new Date(),
        },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: AuditAction.ACKNOWLEDGE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: "Responsavel confirmou o recebimento do alerta.",
          metadata: { alertPublicId: alert.publicId },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "Recebimento confirmado com sucesso.",
    });
  } catch (error: unknown) {
    console.error("Erro ao confirmar recebimento do alerta:", error);
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel confirmar o recebimento do alerta." },
      { status: 500 },
    );
  }
}

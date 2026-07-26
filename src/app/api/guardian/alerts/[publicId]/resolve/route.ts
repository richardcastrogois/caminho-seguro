import { NextResponse } from "next/server";
import { AlertStatus, AuditAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_GUARDIAN_EMAIL = "ana.responsavel@caminhoseguro.demo";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { publicId } = await context.params;

    const guardianUser = await prisma.user.findUnique({
      where: {
        email: DEMO_GUARDIAN_EMAIL,
      },
      select: {
        id: true,
      },
    });

    if (!guardianUser) {
      return NextResponse.json(
        {
          ok: false,
          error: "Responsável de demonstração não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const alert = await prisma.alert.findFirst({
      where: {
        publicId,
        child: {
          guardians: {
            some: {
              guardian: {
                is: {
                  userId: guardianUser.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        publicId: true,
        status: true,
      },
    });

    if (!alert) {
      return NextResponse.json(
        {
          ok: false,
          error: "Alerta não encontrado ou acesso não autorizado.",
        },
        {
          status: 404,
        },
      );
    }

    if (alert.status === AlertStatus.RESOLVED) {
      return NextResponse.json({
        ok: true,
        message: "Este alerta já estava resolvido.",
      });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.alert.update({
        where: {
          id: alert.id,
        },
        data: {
          status: AlertStatus.RESOLVED,
          acknowledgedByUserId: guardianUser.id,
          acknowledgedAt: new Date(),
          resolvedByUserId: guardianUser.id,
          resolvedAt: new Date(),
          resolutionNotes:
            "Alerta marcado como resolvido pelo responsável no painel de demonstração.",
        },
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: guardianUser.id,
          action: AuditAction.RESOLVE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: "Responsável marcou o alerta como resolvido.",
          metadata: {
            alertPublicId: alert.publicId,
            environment: "demo",
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "Alerta resolvido com sucesso.",
    });
  } catch (error: unknown) {
    console.error("Erro ao resolver alerta:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível resolver o alerta.",
      },
      {
        status: 500,
      },
    );
  }
}

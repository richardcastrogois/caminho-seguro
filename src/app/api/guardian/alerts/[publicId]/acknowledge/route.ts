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
      return NextResponse.json(
        {
          ok: false,
          error: "Este alerta já foi resolvido.",
        },
        {
          status: 409,
        },
      );
    }

    if (alert.status === AlertStatus.ACKNOWLEDGED) {
      return NextResponse.json({
        ok: true,
        message: "O recebimento deste alerta já havia sido confirmado.",
      });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.alert.update({
        where: {
          id: alert.id,
        },
        data: {
          status: AlertStatus.ACKNOWLEDGED,
          acknowledgedByUserId: guardianUser.id,
          acknowledgedAt: new Date(),
        },
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: guardianUser.id,
          action: AuditAction.ACKNOWLEDGE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: "Responsável confirmou o recebimento do alerta.",
          metadata: {
            alertPublicId: alert.publicId,
            environment: "demo",
          },
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
      {
        ok: false,
        error: "Não foi possível confirmar o recebimento do alerta.",
      },
      {
        status: 500,
      },
    );
  }
}

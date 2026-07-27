import { NextResponse } from "next/server";
import { AlertStatus, AuditAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeDemoRequest } from "@/lib/demo-auth";

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
    if (!(await authorizeDemoRequest(["guardian", "admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso do responsavel necessario." },
        { status: 401 },
      );
    }

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
          error: "ResponsÃƒÂ¡vel de demonstraÃƒÂ§ÃƒÂ£o nÃƒÂ£o encontrado.",
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
          error: "Alerta nÃƒÂ£o encontrado ou acesso nÃƒÂ£o autorizado.",
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
          error: "Este alerta jÃƒÂ¡ foi resolvido.",
        },
        {
          status: 409,
        },
      );
    }

    if (alert.status === AlertStatus.ACKNOWLEDGED) {
      return NextResponse.json({
        ok: true,
        message: "O recebimento deste alerta jÃƒÂ¡ havia sido confirmado.",
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
          description: "ResponsÃƒÂ¡vel confirmou o recebimento do alerta.",
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
        error: "NÃƒÂ£o foi possÃƒÂ­vel confirmar o recebimento do alerta.",
      },
      {
        status: 500,
      },
    );
  }
}

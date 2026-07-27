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
      return NextResponse.json({
        ok: true,
        message: "Este alerta jÃƒÂ¡ estava resolvido.",
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
            "Alerta marcado como resolvido pelo responsÃƒÂ¡vel no painel de demonstraÃƒÂ§ÃƒÂ£o.",
        },
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: guardianUser.id,
          action: AuditAction.RESOLVE_ALERT,
          entityType: "Alert",
          entityId: alert.id,
          description: "ResponsÃƒÂ¡vel marcou o alerta como resolvido.",
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
        error: "NÃƒÂ£o foi possÃƒÂ­vel resolver o alerta.",
      },
      {
        status: 500,
      },
    );
  }
}

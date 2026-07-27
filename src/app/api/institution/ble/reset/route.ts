import { NextResponse } from "next/server";
import { AuditAction, EventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeDemoRequest } from "@/lib/demo-auth";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_SCHOOL_PUBLIC_ID = "instituicao-demo-escola";
const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";
const DEMO_OPERATOR_EMAIL = "operador.escola@caminhoseguro.demo";

export async function POST() {
  try {
    if (!(await authorizeDemoRequest(["school", "admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso institucional necessario." },
        { status: 401 },
      );
    }

    const { start, end } = getSaoPauloDayRange();

    const [school, child, operator] = await Promise.all([
      prisma.institution.findUnique({
        where: {
          publicId: DEMO_SCHOOL_PUBLIC_ID,
        },
        select: {
          id: true,
        },
      }),
      prisma.child.findUnique({
        where: {
          publicId: DEMO_CHILD_PUBLIC_ID,
        },
        select: {
          id: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          email: DEMO_OPERATOR_EMAIL,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!school || !child) {
      return NextResponse.json(
        {
          ok: false,
          error: "Os dados da demonstraÃƒÂ§ÃƒÂ£o nÃƒÂ£o foram encontrados.",
        },
        {
          status: 404,
        },
      );
    }

    const arrivalEvents = await prisma.protectionEvent.findMany({
      where: {
        childId: child.id,
        institutionId: school.id,
        type: EventType.SCHOOL_ARRIVAL,
        occurredAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    await prisma.$transaction(async (transaction) => {
      if (arrivalEvents.length > 0) {
        await transaction.protectionEvent.deleteMany({
          where: {
            id: {
              in: arrivalEvents.map((event) => event.id),
            },
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          actorUserId: operator?.id ?? null,
          action: AuditAction.DELETE,
          entityType: "DemoSchoolArrival",
          description: "Eventos de chegada da demonstraÃƒÂ§ÃƒÂ£o foram reiniciados.",
          metadata: {
            environment: "demo",
            deletedEvents: arrivalEvents.map((event) => event.publicId),
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message:
        arrivalEvents.length > 0
          ? "DemonstraÃƒÂ§ÃƒÂ£o reiniciada. Maria voltou ao estado de chegada pendente."
          : "A demonstraÃƒÂ§ÃƒÂ£o jÃƒÂ¡ estava pronta para uma nova chegada.",
      deletedEvents: arrivalEvents.length,
    });
  } catch (error: unknown) {
    console.error("Erro ao reiniciar demonstraÃƒÂ§ÃƒÂ£o BLE:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "NÃƒÂ£o foi possÃƒÂ­vel reiniciar a demonstraÃƒÂ§ÃƒÂ£o.",
      },
      {
        status: 500,
      },
    );
  }
}

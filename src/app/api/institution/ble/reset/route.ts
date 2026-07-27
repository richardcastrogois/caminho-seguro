import { NextResponse } from "next/server";
import { AuditAction, EventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_SCHOOL_PUBLIC_ID = "instituicao-demo-escola";
const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";
const DEMO_OPERATOR_EMAIL = "operador.escola@caminhoseguro.demo";

export async function POST() {
  try {
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
          error: "Os dados da demonstração não foram encontrados.",
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
          description: "Eventos de chegada da demonstração foram reiniciados.",
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
          ? "Demonstração reiniciada. Maria voltou ao estado de chegada pendente."
          : "A demonstração já estava pronta para uma nova chegada.",
      deletedEvents: arrivalEvents.length,
    });
  } catch (error: unknown) {
    console.error("Erro ao reiniciar demonstração BLE:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível reiniciar a demonstração.",
      },
      {
        status: 500,
      },
    );
  }
}

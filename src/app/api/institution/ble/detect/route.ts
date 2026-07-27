import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  AuditAction,
  BlockchainStatus,
  EventSeverity,
  EventSource,
  EventStatus,
  EventType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeDemoRequest } from "@/lib/demo-auth";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_SCHOOL_PUBLIC_ID = "instituicao-demo-escola";
const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";
const DEMO_GATEWAY_TOKEN = "gateway-demo-portao-escola";
const DEMO_OPERATOR_EMAIL = "operador.escola@caminhoseguro.demo";

export async function POST() {
  try {
    if (!(await authorizeDemoRequest(["school", "admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso institucional necessario." },
        { status: 401 },
      );
    }

    const { start, end, dateKey } = getSaoPauloDayRange();

    const [school, child, gateway, operator] = await Promise.all([
      prisma.institution.findUnique({
        where: {
          publicId: DEMO_SCHOOL_PUBLIC_ID,
        },
        select: {
          id: true,
          publicId: true,
          name: true,
          latitude: true,
          longitude: true,
        },
      }),
      prisma.child.findUnique({
        where: {
          publicId: DEMO_CHILD_PUBLIC_ID,
        },
        select: {
          id: true,
          publicId: true,
          firstName: true,
          lastName: true,
          identifiers: {
            where: {
              type: "BLE",
              status: "ACTIVE",
            },
            take: 1,
            select: {
              id: true,
              publicToken: true,
            },
          },
        },
      }),
      prisma.gatewayIdentifier.findUnique({
        where: {
          publicToken: DEMO_GATEWAY_TOKEN,
        },
        select: {
          id: true,
          publicToken: true,
          institutionId: true,
          status: true,
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

    if (!school || !child || !gateway) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Os dados institucionais da demonstraÃƒÂ§ÃƒÂ£o nÃƒÂ£o foram encontrados.",
        },
        {
          status: 404,
        },
      );
    }

    if (gateway.status !== "ACTIVE") {
      return NextResponse.json(
        {
          ok: false,
          error: "O gateway Bluetooth estÃƒÂ¡ inativo.",
        },
        {
          status: 409,
        },
      );
    }

    if (gateway.institutionId !== school.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "O gateway nÃƒÂ£o pertence ÃƒÂ  instituiÃƒÂ§ÃƒÂ£o informada.",
        },
        {
          status: 409,
        },
      );
    }

    const bleIdentifier = child.identifiers[0];

    if (!bleIdentifier) {
      return NextResponse.json(
        {
          ok: false,
          error: "A crianÃƒÂ§a nÃƒÂ£o possui um identificador BLE ativo.",
        },
        {
          status: 404,
        },
      );
    }

    const existingArrival = await prisma.protectionEvent.findFirst({
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
        publicId: true,
        occurredAt: true,
      },
    });

    if (existingArrival) {
      return NextResponse.json(
        {
          ok: false,
          error: `${child.firstName} jÃƒÂ¡ possui uma chegada registrada hoje.`,
          reference: existingArrival.publicId,
        },
        {
          status: 409,
        },
      );
    }

    const occurredAt = new Date();

    const canonicalEvent = {
      version: 1,
      childPublicId: child.publicId,
      institutionPublicId: school.publicId,
      identifierPublicToken: bleIdentifier.publicToken,
      gatewayPublicToken: gateway.publicToken,
      type: EventType.SCHOOL_ARRIVAL,
      occurredAt: occurredAt.toISOString(),
    };

    const eventHash = createHash("sha256")
      .update(JSON.stringify(canonicalEvent))
      .digest("hex");

    const eventPublicId = `school-arrival-demo-${dateKey}`;

    const event = await prisma.$transaction(async (transaction) => {
      const createdEvent = await transaction.protectionEvent.create({
        data: {
          publicId: eventPublicId,
          childId: child.id,
          identifierId: bleIdentifier.id,
          gatewayId: gateway.id,
          institutionId: school.id,
          createdByUserId: operator?.id ?? null,
          type: EventType.SCHOOL_ARRIVAL,
          source: EventSource.BLE_GATEWAY,
          severity: EventSeverity.INFORMATIONAL,
          status: EventStatus.VALIDATED,
          latitude: school.latitude,
          longitude: school.longitude,
          locationLabel: "PortÃƒÂ£o principal da escola",
          occurredAt,
          validatedAt: occurredAt,
          metadata: {
            simulation: true,
            simulationKey: "school-arrival-demo",
            signalStrength: -47,
            detectionDurationSeconds: 6,
            gatewayPublicToken: gateway.publicToken,
          },
        },
      });

      await transaction.blockchainRecord.create({
        data: {
          eventId: createdEvent.id,
          network: "solana-devnet",
          status: BlockchainStatus.PENDING,
          eventHash,
          programVersion: "1",
        },
      });

      await transaction.gatewayIdentifier.update({
        where: {
          id: gateway.id,
        },
        data: {
          lastSeenAt: occurredAt,
        },
      });

      await transaction.childIdentifier.update({
        where: {
          id: bleIdentifier.id,
        },
        data: {
          lastSeenAt: occurredAt,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: operator?.id ?? null,
          action: AuditAction.CREATE,
          entityType: "ProtectionEvent",
          entityId: createdEvent.id,
          description: "Chegada escolar registrada pelo simulador de gateway BLE.",
          metadata: {
            environment: "demo",
            eventPublicId: createdEvent.publicId,
            gatewayPublicToken: gateway.publicToken,
            signalStrength: -47,
          },
        },
      });

      return createdEvent;
    });

    return NextResponse.json(
      {
        ok: true,
        message: `${child.firstName} ${child.lastName} chegou ÃƒÂ  escola. O responsÃƒÂ¡vel jÃƒÂ¡ pode visualizar o evento.`,
        event: {
          publicId: event.publicId,
          occurredAt: event.occurredAt.toISOString(),
          blockchainStatus: BlockchainStatus.PENDING,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Erro ao registrar detecÃƒÂ§ÃƒÂ£o BLE:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "NÃƒÂ£o foi possÃƒÂ­vel registrar a detecÃƒÂ§ÃƒÂ£o Bluetooth.",
      },
      {
        status: 500,
      },
    );
  }
}

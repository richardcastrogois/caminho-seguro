import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  EventSeverity,
  EventSource,
  EventStatus,
  EventType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  token: z.string().min(8).max(200),
  situation: z.enum(["HELP_REQUEST", "CHILD_FOUND", "CHILD_AT_RISK", "MEDICAL_HELP"]),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  locationAccuracy: z.number().nonnegative().nullable(),
  notes: z.string().trim().max(500).optional().default(""),
});

const situationConfig = {
  HELP_REQUEST: {
    eventType: EventType.HELP_REQUEST,
    alertType: AlertType.HELP_REQUEST,
    severity: AlertSeverity.HIGH,
    eventSeverity: EventSeverity.CRITICAL,
    title: "Criança solicitou ajuda",
    message: "Uma pessoa informou que a criança protegida solicitou ajuda.",
  },
  CHILD_FOUND: {
    eventType: EventType.CHILD_FOUND,
    alertType: AlertType.CHILD_FOUND,
    severity: AlertSeverity.HIGH,
    eventSeverity: EventSeverity.ATTENTION,
    title: "Criança encontrada",
    message:
      "Uma pessoa informou que encontrou a criança protegida aparentemente desacompanhada.",
  },
  CHILD_AT_RISK: {
    eventType: EventType.CHILD_AT_RISK,
    alertType: AlertType.CHILD_AT_RISK,
    severity: AlertSeverity.CRITICAL,
    eventSeverity: EventSeverity.CRITICAL,
    title: "Possível situação de risco",
    message:
      "Uma pessoa informou que a criança protegida aparenta estar em situação de risco.",
  },
  MEDICAL_HELP: {
    eventType: EventType.HELP_REQUEST,
    alertType: AlertType.HELP_REQUEST,
    severity: AlertSeverity.CRITICAL,
    eventSeverity: EventSeverity.CRITICAL,
    title: "Possível necessidade de atendimento",
    message: "Uma pessoa informou que a criança protegida pode precisar de atendimento.",
  },
} as const;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedBody = requestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Dados inválidos para registrar o pedido de ajuda.",
        },
        {
          status: 400,
        },
      );
    }

    const { token, situation, latitude, longitude, locationAccuracy, notes } =
      parsedBody.data;

    const identifier = await prisma.childIdentifier.findFirst({
      where: {
        publicToken: token,
        status: "ACTIVE",
        type: "QR_CODE",
      },
      select: {
        id: true,
        childId: true,
      },
    });

    if (!identifier) {
      return NextResponse.json(
        {
          ok: false,
          error: "Identificador inválido, inativo ou revogado.",
        },
        {
          status: 404,
        },
      );
    }

    const config = situationConfig[situation];

    const result = await prisma.$transaction(async (transaction) => {
      const event = await transaction.protectionEvent.create({
        data: {
          childId: identifier.childId,
          identifierId: identifier.id,
          type: config.eventType,
          source: EventSource.QR_PUBLIC_SCAN,
          severity: config.eventSeverity,
          status: EventStatus.VALIDATED,
          latitude,
          longitude,
          locationLabel:
            latitude !== null && longitude !== null
              ? "Localização compartilhada pelo cidadão"
              : "Localização não compartilhada",
          notes: notes || null,
          occurredAt: new Date(),
          validatedAt: new Date(),
          metadata: {
            publicScan: true,
            locationAccuracy,
            situation,
          },
        },
      });

      const alert = await transaction.alert.create({
        data: {
          childId: identifier.childId,
          eventId: event.id,
          type: config.alertType,
          severity: config.severity,
          status: AlertStatus.OPEN,
          title: config.title,
          message: config.message,
        },
      });

      const guardians = await transaction.childGuardian.findMany({
        where: {
          childId: identifier.childId,
          canReceiveAlerts: true,
        },
        select: {
          guardian: {
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (guardians.length > 0) {
        await transaction.notification.createMany({
          data: guardians.flatMap((relation) => [
            {
              userId: relation.guardian.user.id,
              alertId: alert.id,
              channel: "DASHBOARD",
              status: "DELIVERED",
              recipient: relation.guardian.user.email,
              subject: config.title,
              content: config.message,
              sentAt: new Date(),
              deliveredAt: new Date(),
            },
            {
              userId: relation.guardian.user.id,
              alertId: alert.id,
              channel: "BROWSER_PUSH",
              status: "PENDING",
              recipient: relation.guardian.user.email,
              subject: config.title,
              content: config.message,
            },
          ]),
        });
      }

      return {
        eventPublicId: event.publicId,
        alertPublicId: alert.publicId,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        message: "O alerta foi registrado e encaminhado à rede de proteção.",
        reference: result.alertPublicId,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Erro ao criar alerta público:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível registrar o alerta neste momento.",
      },
      {
        status: 500,
      },
    );
  }
}

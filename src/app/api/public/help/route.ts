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
import { dispatchAlertNotifications } from "@/lib/notifications";
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
    title: "Crianca solicitou ajuda",
    message: "Uma pessoa informou que a crianca protegida solicitou ajuda.",
  },
  CHILD_FOUND: {
    eventType: EventType.CHILD_FOUND,
    alertType: AlertType.CHILD_FOUND,
    severity: AlertSeverity.HIGH,
    eventSeverity: EventSeverity.ATTENTION,
    title: "Crianca encontrada",
    message: "Uma pessoa informou que encontrou a crianca protegida aparentemente desacompanhada.",
  },
  CHILD_AT_RISK: {
    eventType: EventType.CHILD_AT_RISK,
    alertType: AlertType.CHILD_AT_RISK,
    severity: AlertSeverity.CRITICAL,
    eventSeverity: EventSeverity.CRITICAL,
    title: "Possivel situacao de risco",
    message: "Uma pessoa informou que a crianca protegida aparenta estar em situacao de risco.",
  },
  MEDICAL_HELP: {
    eventType: EventType.HELP_REQUEST,
    alertType: AlertType.HELP_REQUEST,
    severity: AlertSeverity.CRITICAL,
    eventSeverity: EventSeverity.CRITICAL,
    title: "Possivel necessidade de atendimento",
    message: "Uma pessoa informou que a crianca protegida pode precisar de atendimento.",
  },
} as const;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedBody = requestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados invalidos para registrar o pedido de ajuda." },
        { status: 400 },
      );
    }

    const { token, situation, latitude, longitude, locationAccuracy, notes } = parsedBody.data;

    const identifier = await prisma.childIdentifier.findFirst({
      where: { publicToken: token, status: "ACTIVE", type: "QR_CODE" },
      select: { id: true, childId: true },
    });

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "Identificador invalido, inativo ou revogado." },
        { status: 404 },
      );
    }

    const config = situationConfig[situation];
    const occurredAt = new Date();
    const locationLabel =
      latitude !== null && longitude !== null
        ? "Localizacao compartilhada pelo cidadao"
        : "Localizacao nao compartilhada";

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
          locationLabel,
          notes: notes || null,
          occurredAt,
          validatedAt: occurredAt,
          metadata: { publicScan: true, locationAccuracy, situation },
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
        select: { id: true, publicId: true },
      });

      const guardians = await transaction.childGuardian.findMany({
        where: { childId: identifier.childId, canReceiveAlerts: true },
        select: {
          guardian: {
            select: {
              notificationOpt: {
                select: { browserPush: true, telegram: true, telegramChatId: true },
              },
              user: { select: { id: true, email: true } },
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
              sentAt: occurredAt,
              deliveredAt: occurredAt,
            },
            {
              userId: relation.guardian.user.id,
              alertId: alert.id,
              channel: "BROWSER_PUSH",
              status: relation.guardian.notificationOpt?.browserPush === false ? "FAILED" : "PENDING",
              recipient: relation.guardian.user.email,
              subject: config.title,
              content: config.message,
              failureReason:
                relation.guardian.notificationOpt?.browserPush === false
                  ? "Preferencia de notificacao do navegador desativada."
                  : null,
            },
          ]),
        });
      }

      return {
        eventPublicId: event.publicId,
        alertId: alert.id,
        alertPublicId: alert.publicId,
        targets: guardians.map((relation) => ({
          userId: relation.guardian.user.id,
          email: relation.guardian.user.email,
          telegramEnabled: relation.guardian.notificationOpt?.telegram ?? false,
          telegramChatId: relation.guardian.notificationOpt?.telegramChatId ?? null,
        })),
      };
    });

    await dispatchAlertNotifications({
      alertId: result.alertId,
      title: config.title,
      message: config.message,
      severity: config.severity,
      targets: result.targets,
      locationLabel,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "O alerta foi registrado e encaminhado a rede de protecao.",
        reference: result.alertPublicId,
        event: result.eventPublicId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao criar alerta publico:", error);

    return NextResponse.json(
      { ok: false, error: "Nao foi possivel registrar o alerta neste momento." },
      { status: 500 },
    );
  }
}
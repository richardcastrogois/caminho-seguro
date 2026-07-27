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
import { blockchainService } from "@/features/blockchain/blockchain.service";

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

      return {
        eventId: event.id,
        eventPublicId: event.publicId,
        alertPublicId: alert.publicId,
      };
    });

    const fullEvent = await prisma.protectionEvent.findUniqueOrThrow({
      where: { id: result.eventId },
      include: { child: true },
    });

    let eventHash: string;
    let blockchainRecord: Record<string, unknown> | null = null;

    try {
      eventHash = await blockchainService.hashEvent(fullEvent);
      const submitResult = await blockchainService.submitEvent(eventHash);

      blockchainRecord = await prisma.blockchainRecord.upsert({
        where: { eventId: result.eventId },
        update: {
          eventHash,
          transactionHash: submitResult.transactionHash,
          slot: BigInt(submitResult.slot),
          status: "CONFIRMED",
          submittedAt: new Date(),
          confirmedAt: new Date(),
          network: "solana-devnet",
        },
        create: {
          eventId: result.eventId,
          eventHash,
          transactionHash: submitResult.transactionHash,
          slot: BigInt(submitResult.slot),
          status: "CONFIRMED",
          submittedAt: new Date(),
          confirmedAt: new Date(),
          network: "solana-devnet",
        },
      });
    } catch {
      try {
        eventHash = await blockchainService.hashEvent(fullEvent);
      } catch {
        eventHash = "hash_error";
      }

      blockchainRecord = await prisma.blockchainRecord.upsert({
        where: { eventId: result.eventId },
        update: { eventHash, status: "PENDING" },
        create: {
          eventId: result.eventId,
          eventHash,
          status: "PENDING",
          network: "solana-devnet",
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "O alerta foi registrado e encaminhado à rede de proteção.",
        reference: result.alertPublicId,
        blockchain: blockchainRecord
          ? {
              status: blockchainRecord.status,
              transactionHash: blockchainRecord.transactionHash ?? null,
              slot: blockchainRecord.slot?.toString() ?? null,
            }
          : null,
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

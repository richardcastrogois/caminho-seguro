import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AuditAction,
  EventSeverity,
  EventSource,
  EventStatus,
  EventType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_TRANSPORT_PUBLIC_ID = "instituicao-demo-transporte";
const requestSchema = z.object({
  action: z.enum(["BUS_BOARDING", "DISEMBARKING_BUS"]),
  childPublicId: z.string().min(8).max(200),
});

const eventConfig = {
  BUS_BOARDING: {
    label: "Embarque confirmado no ponto comunitário",
    type: EventType.BUS_BOARDING,
  },
  DISEMBARKING_BUS: {
    label: "Desembarque confirmado na rota escolar",
    type: EventType.DISEMBARKING_BUS,
  },
} as const;

export async function POST(request: Request) {
  try {
    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados inválidos para o evento de transporte." },
        { status: 400 },
      );
    }

    const { action, childPublicId } = parsedBody.data;
    const { start, end } = getSaoPauloDayRange();
    const [transport, child] = await Promise.all([
      prisma.institution.findUnique({
        where: { publicId: DEMO_TRANSPORT_PUBLIC_ID },
        select: {
          id: true,
          transportRoutes: { where: { active: true }, take: 1, select: { id: true } },
        },
      }),
      prisma.child.findUnique({
        where: { publicId: childPublicId },
        select: {
          id: true,
          publicId: true,
          firstName: true,
          identifiers: {
            where: { type: "BLE", status: "ACTIVE" },
            take: 1,
            select: { id: true },
          },
          enrollments: {
            where: { institution: { publicId: DEMO_TRANSPORT_PUBLIC_ID }, active: true },
            take: 1,
            select: { id: true },
          },
        },
      }),
    ]);

    if (!transport || !child || child.enrollments.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Criança ou vínculo de transporte da demonstração não encontrado.",
        },
        { status: 404 },
      );
    }
    if (!transport.transportRoutes[0] || !child.identifiers[0]) {
      return NextResponse.json(
        { ok: false, error: "Rota ativa ou identificador BLE não disponível." },
        { status: 409 },
      );
    }

    const config = eventConfig[action];
    const existingEvent = await prisma.protectionEvent.findFirst({
      where: {
        childId: child.id,
        institutionId: transport.id,
        type: config.type,
        occurredAt: { gte: start, lte: end },
      },
      select: { publicId: true },
    });
    if (existingEvent) {
      return NextResponse.json(
        {
          ok: false,
          error: "Este evento já foi registrado hoje.",
          reference: existingEvent.publicId,
        },
        { status: 409 },
      );
    }

    const occurredAt = new Date();
    const event = await prisma.$transaction(async (transaction) => {
      const createdEvent = await transaction.protectionEvent.create({
        data: {
          childId: child.id,
          identifierId: child.identifiers[0].id,
          institutionId: transport.id,
          transportRouteId: transport.transportRoutes[0].id,
          type: config.type,
          source: EventSource.MANUAL,
          severity: EventSeverity.INFORMATIONAL,
          status: EventStatus.VALIDATED,
          locationLabel: config.label,
          occurredAt,
          validatedAt: occurredAt,
          metadata: { environment: "demo", assistedTransportEvent: true },
        },
      });
      await transaction.childIdentifier.update({
        where: { id: child.identifiers[0].id },
        data: { lastSeenAt: occurredAt },
      });
      await transaction.auditLog.create({
        data: {
          action: AuditAction.CREATE,
          entityType: "ProtectionEvent",
          entityId: createdEvent.id,
          description: `Evento de transporte assistido: ${config.type}.`,
          metadata: {
            environment: "demo",
            eventPublicId: createdEvent.publicId,
            childPublicId: child.publicId,
          },
        },
      });
      return createdEvent;
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Evento de transporte registrado.",
        event: { publicId: event.publicId, occurredAt: event.occurredAt.toISOString() },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao registrar evento de transporte:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível registrar o evento de transporte." },
      { status: 500 },
    );
  }
}

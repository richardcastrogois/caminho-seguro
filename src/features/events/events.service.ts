import { prisma } from "@/lib/prisma";
import { blockchainService } from "@/features/blockchain/blockchain.service";
import type { CreateEventInput, CreateEventResult } from "./events.types";

export const eventsService = {
  async createEvent(input: CreateEventInput): Promise<CreateEventResult> {
    const created = await prisma.protectionEvent.create({
      data: {
        childId: input.childId,
        type: input.type,
        source: input.source,
        occurredAt: input.occurredAt ?? new Date(),
        identifierId: input.identifierId,
        gatewayId: input.gatewayId,
        institutionId: input.institutionId,
        transportRouteId: input.transportRouteId,
        createdByUserId: input.createdByUserId,
        severity: input.severity ?? "INFORMATIONAL",
        latitude: input.latitude,
        longitude: input.longitude,
        locationLabel: input.locationLabel,
        notes: input.notes,
        metadata: input.metadata as any,
        status: "RECEIVED",
      },
    });

    const event = await prisma.protectionEvent.findUniqueOrThrow({
      where: { id: created.id },
      include: { child: true },
    });

    let blockchainResult: CreateEventResult["blockchain"] = null;

    try {
      const eventHash = await blockchainService.hashEvent(event);
      const submitResult = await blockchainService.submitEvent(eventHash);

      await prisma.blockchainRecord.upsert({
        where: { eventId: event.id },
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
          eventId: event.id,
          eventHash,
          transactionHash: submitResult.transactionHash,
          slot: BigInt(submitResult.slot),
          status: "CONFIRMED",
          submittedAt: new Date(),
          confirmedAt: new Date(),
          network: "solana-devnet",
        },
      });

      await prisma.protectionEvent.update({
        where: { id: event.id },
        data: { status: "VALIDATED" },
      });

      blockchainResult = {
        eventHash,
        transactionHash: submitResult.transactionHash,
        slot: submitResult.slot.toString(),
        status: "CONFIRMED",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Blockchain submit falhou, evento salvo como PENDING:", message);

      const eventHash = await blockchainService.hashEvent(event);

      await prisma.blockchainRecord.upsert({
        where: { eventId: event.id },
        update: { eventHash, status: "PENDING" },
        create: {
          eventId: event.id,
          eventHash,
          status: "PENDING",
          network: "solana-devnet",
        },
      });

      blockchainResult = {
        eventHash,
        transactionHash: null,
        slot: null,
        status: "PENDING",
      };
    }

    return {
      event: {
        id: event.id,
        publicId: event.publicId,
        type: event.type,
        source: event.source,
        severity: event.severity,
        status: event.status,
        occurredAt: event.occurredAt.toISOString(),
        child: { publicId: event.child.publicId },
      },
      blockchain: blockchainResult,
    };
  },

  async getEvent(id: string) {
    return prisma.protectionEvent.findUnique({
      where: { id },
      include: {
        child: true,
        identifier: true,
        gateway: true,
        institution: true,
        transportRoute: true,
        createdBy: { select: { id: true, name: true, email: true } },
        blockchainRecord: true,
        alerts: true,
      },
    });
  },

  async listEvents(filters: {
    childId?: string;
    institutionId?: string;
    type?: string;
    source?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (filters.childId) where.childId = filters.childId;
    if (filters.institutionId) where.institutionId = filters.institutionId;
    if (filters.type) where.type = filters.type;
    if (filters.source) where.source = filters.source;

    if (filters.from || filters.to) {
      where.occurredAt = {};
      if (filters.from)
        (where.occurredAt as Record<string, unknown>).gte = new Date(filters.from);
      if (filters.to)
        (where.occurredAt as Record<string, unknown>).lte = new Date(filters.to);
    }

    const [events, total] = await Promise.all([
      prisma.protectionEvent.findMany({
        where,
        include: {
          child: {
            select: { id: true, publicId: true, firstName: true, lastName: true },
          },
          institution: { select: { id: true, name: true, type: true } },
          blockchainRecord: true,
        },
        orderBy: { occurredAt: "desc" },
        take: filters.limit ?? 50,
        skip: filters.offset ?? 0,
      }),
      prisma.protectionEvent.count({ where }),
    ]);

    return { events, total };
  },
};

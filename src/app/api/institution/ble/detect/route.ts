import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, BlockchainStatus, EventSeverity, EventSource, EventStatus, EventType } from "@/generated/prisma/client";
import { tryCreateBlockchainActorHash } from "@/lib/blockchain-identity";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, findUserInstitution, unauthorizedResponse } from "@/lib/session";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({ childPublicId: z.string().min(8).max(200).optional() }).optional();

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["INSTITUTION_MEMBER", "ADMIN"], request);
    if (!user) return unauthorizedResponse("Acesso institucional necessario.");

    const school = await findUserInstitution(user, ["SCHOOL"]);
    if (!school) return unauthorizedResponse("Usuario sem vinculo com escola ativa.");

    const body = await request.json().catch(() => undefined);
    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: "Dados invalidos para deteccao BLE." }, { status: 400 });
    }

    const { start, end, dateKey } = getSaoPauloDayRange();
    const requestedChildPublicId = parsedBody.data?.childPublicId;

    const gateway = await prisma.gatewayIdentifier.findFirst({
      where: { institutionId: school.id, type: "BLE", status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: { id: true, publicToken: true, institutionId: true, status: true },
    });

    const child = await prisma.child.findFirst({
      where: {
        status: "ACTIVE",
        ...(requestedChildPublicId ? { publicId: requestedChildPublicId } : {}),
        enrollments: { some: { institutionId: school.id, active: true } },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        publicId: true,
        firstName: true,
        lastName: true,
        identifiers: { where: { type: "BLE", status: "ACTIVE" }, take: 1, select: { id: true, publicToken: true } },
      },
    });

    if (!child || !gateway) {
      return NextResponse.json({ ok: false, error: "Escola, crianca ou gateway BLE nao encontrado." }, { status: 404 });
    }

    const bleIdentifier = child.identifiers[0];
    if (!bleIdentifier) {
      return NextResponse.json({ ok: false, error: "A crianca nao possui um identificador BLE ativo." }, { status: 404 });
    }

    const existingArrival = await prisma.protectionEvent.findFirst({
      where: { childId: child.id, institutionId: school.id, type: EventType.SCHOOL_ARRIVAL, occurredAt: { gte: start, lte: end } },
      select: { publicId: true, occurredAt: true },
    });
    if (existingArrival) {
      return NextResponse.json({ ok: false, error: `${child.firstName} ja possui uma chegada registrada hoje.`, reference: existingArrival.publicId }, { status: 409 });
    }

    const occurredAt = new Date();
    const canonicalEvent = {
      version: 1,
      childPublicId: child.publicId,
      institutionPublicId: school.publicId,
      identifierPublicToken: bleIdentifier.publicToken,
      gatewayPublicToken: gateway.publicToken,
      actorHash: tryCreateBlockchainActorHash(user.id),
      type: EventType.SCHOOL_ARRIVAL,
      occurredAt: occurredAt.toISOString(),
    };
    const eventHash = createHash("sha256").update(JSON.stringify(canonicalEvent)).digest("hex");
    const eventPublicId = `school-arrival-${child.publicId}-${dateKey}`;

    const event = await prisma.$transaction(async (transaction) => {
      const createdEvent = await transaction.protectionEvent.create({
        data: {
          publicId: eventPublicId,
          childId: child.id,
          identifierId: bleIdentifier.id,
          gatewayId: gateway.id,
          institutionId: school.id,
          createdByUserId: user.id,
          type: EventType.SCHOOL_ARRIVAL,
          source: EventSource.BLE_GATEWAY,
          severity: EventSeverity.INFORMATIONAL,
          status: EventStatus.VALIDATED,
          latitude: school.latitude,
          longitude: school.longitude,
          locationLabel: "Portao principal da escola",
          occurredAt,
          validatedAt: occurredAt,
          metadata: { simulation: true, signalStrength: -47, detectionDurationSeconds: 6, gatewayPublicToken: gateway.publicToken, actorHash: tryCreateBlockchainActorHash(user.id) },
        },
      });
      await transaction.blockchainRecord.create({ data: { eventId: createdEvent.id, network: "solana-devnet", status: BlockchainStatus.PENDING, eventHash, programVersion: "1" } });
      await transaction.gatewayIdentifier.update({ where: { id: gateway.id }, data: { lastSeenAt: occurredAt } });
      await transaction.childIdentifier.update({ where: { id: bleIdentifier.id }, data: { lastSeenAt: occurredAt } });
      await transaction.auditLog.create({
        data: { actorUserId: user.id, action: AuditAction.CREATE, entityType: "ProtectionEvent", entityId: createdEvent.id, description: "Chegada escolar registrada pelo simulador de gateway BLE.", metadata: { eventPublicId: createdEvent.publicId, gatewayPublicToken: gateway.publicToken, actorHash: tryCreateBlockchainActorHash(user.id) } },
      });
      return createdEvent;
    });

    return NextResponse.json({ ok: true, message: `${child.firstName} ${child.lastName} chegou a escola. O responsavel ja pode visualizar o evento.`, event: { publicId: event.publicId, occurredAt: event.occurredAt.toISOString(), blockchainStatus: BlockchainStatus.PENDING } }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao registrar deteccao BLE:", error);
    return NextResponse.json({ ok: false, error: "Nao foi possivel registrar a deteccao Bluetooth." }, { status: 500 });
  }
}
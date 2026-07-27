import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, EventSeverity, EventSource, EventStatus, EventType } from "@/generated/prisma/client";
import { tryCreateBlockchainActorHash } from "@/lib/blockchain-identity";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, findUserInstitution, unauthorizedResponse } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  action: z.enum(["BUS_BOARDING", "DISEMBARKING_BUS"]),
  childPublicId: z.string().min(8).max(200),
});

const eventConfig = {
  BUS_BOARDING: { label: "Embarque confirmado no ponto comunitario", type: EventType.BUS_BOARDING },
  DISEMBARKING_BUS: { label: "Desembarque confirmado na rota escolar", type: EventType.DISEMBARKING_BUS },
} as const;

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["TRANSPORT_MEMBER", "ADMIN"]);
    if (!user) return unauthorizedResponse("Acesso do transporte necessario.");

    const transport = await findUserInstitution(user, ["TRANSPORT"]);
    if (!transport) return unauthorizedResponse("Usuario sem vinculo com transporte ativo.");

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: "Dados invalidos para o evento de transporte." }, { status: 400 });
    }

    const { action, childPublicId } = parsedBody.data;
    const child = await prisma.child.findUnique({
      where: { publicId: childPublicId },
      select: {
        id: true,
        publicId: true,
        firstName: true,
        identifiers: { where: { type: "BLE", status: "ACTIVE" }, take: 1, select: { id: true } },
        enrollments: { where: { institutionId: transport.id, active: true }, take: 1, select: { id: true } },
      },
    });

    const route = await prisma.transportRoute.findFirst({
      where: { institutionId: transport.id, active: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (!child || child.enrollments.length === 0) {
      return NextResponse.json({ ok: false, error: "Crianca ou vinculo de transporte nao encontrado." }, { status: 404 });
    }
    if (!route || !child.identifiers[0]) {
      return NextResponse.json({ ok: false, error: "Rota ativa ou identificador BLE nao disponivel." }, { status: 409 });
    }

    const config = eventConfig[action];

    const occurredAt = new Date();
    const event = await prisma.$transaction(async (transaction) => {
      const createdEvent = await transaction.protectionEvent.create({
        data: {
          childId: child.id,
          identifierId: child.identifiers[0].id,
          institutionId: transport.id,
          transportRouteId: route.id,
          createdByUserId: user.id,
          type: config.type,
          source: EventSource.MANUAL,
          severity: EventSeverity.INFORMATIONAL,
          status: EventStatus.VALIDATED,
          locationLabel: config.label,
          occurredAt,
          validatedAt: occurredAt,
          metadata: {
            assistedTransportEvent: true,
            actorHash: tryCreateBlockchainActorHash(user.id),
          },
        },
      });
      await transaction.childIdentifier.update({ where: { id: child.identifiers[0].id }, data: { lastSeenAt: occurredAt } });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: AuditAction.CREATE,
          entityType: "ProtectionEvent",
          entityId: createdEvent.id,
          description: `Evento de transporte assistido: ${config.type}.`,
          metadata: { eventPublicId: createdEvent.publicId, childPublicId: child.publicId, actorHash: tryCreateBlockchainActorHash(user.id) },
        },
      });
      return createdEvent;
    });

    return NextResponse.json({ ok: true, message: "Evento de transporte registrado.", event: { publicId: event.publicId, occurredAt: event.occurredAt.toISOString() } }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao registrar evento de transporte:", error);
    return NextResponse.json({ ok: false, error: "Nao foi possivel registrar o evento de transporte." }, { status: 500 });
  }
}
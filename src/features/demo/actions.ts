"use server";

import { EventSeverity, EventSource, EventType } from "@/generated/prisma/client";
import { getDemoSession } from "@/lib/demo-auth";
import { prisma } from "@/lib/prisma";
import { eventsService } from "@/features/events/events.service";

export async function simulateInstitutionalAction() {
  const session = await getDemoSession();
  if (!session || session.profileId !== "admin") {
    return {
      ok: false,
      error: "Entre como Admin para simular a leitura institucional.",
    };
  }

  const child = await prisma.child.findFirst({
    where: { publicId: "crianca-demo-maria" },
    select: { id: true },
  });

  if (!child) {
    return { ok: false, error: "Crianca demo nao encontrada." };
  }

  const school = await prisma.institution.findFirst({
    where: { type: "SCHOOL" },
    select: { id: true },
  });

  if (!school) {
    return { ok: false, error: "Instituicao escola nao encontrada." };
  }

  const identifier = await prisma.childIdentifier.findFirst({
    where: { childId: child.id, status: "ACTIVE", type: "QR_CODE" },
    select: { id: true },
  });

  if (!identifier) {
    return { ok: false, error: "QR Code da crianca nao encontrado." };
  }

  try {
    const result = await eventsService.createEvent({
      childId: child.id,
      type: EventType.SCHOOL_ARRIVAL,
      source: EventSource.QR_INSTITUTION_SCAN,
      severity: EventSeverity.INFORMATIONAL,
      institutionId: school.id,
      identifierId: identifier.id,
      locationLabel: "Portao principal da escola (simulacao)",
      publicId: `sim-ins-${Date.now()}`,
      metadata: { simulation: true, type: "institutional" },
    });

    return { ok: true, ...result };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Erro ao simular evento institucional.",
    };
  }
}

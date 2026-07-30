"use server";

import { EventSeverity, EventSource, EventType } from "@/generated/prisma/client";
import { getDemoSession } from "@/lib/demo-auth";
import { prisma } from "@/lib/prisma";
import { eventsService } from "@/features/events/events.service";

export async function simulateInstitutionalAction() {
  const session = await getDemoSession();
  if (!session) {
    return { ok: false, error: "Faça login com um perfil de demonstração para simular leitura institucional." };
  }

  const child = await prisma.child.findFirst({
    where: { publicId: "crianca-demo-maria" },
    select: { id: true },
  });

  if (!child) {
    return { ok: false, error: "Criança demo não encontrada." };
  }

  const school = await prisma.institution.findFirst({
    where: { type: "SCHOOL" },
    select: { id: true },
  });

  if (!school) {
    return { ok: false, error: "Instituição escola não encontrada." };
  }

  const identifier = await prisma.childIdentifier.findFirst({
    where: { childId: child.id, status: "ACTIVE", type: "QR_CODE" },
    select: { id: true },
  });

  if (!identifier) {
    return { ok: false, error: "QR Code da criança não encontrado." };
  }

  try {
    const result = await eventsService.createEvent({
      childId: child.id,
      type: EventType.SCHOOL_ARRIVAL,
      source: EventSource.QR_INSTITUTION_SCAN,
      severity: EventSeverity.INFORMATIONAL,
      institutionId: school.id,
      identifierId: identifier.id,
      locationLabel: "Portão principal da escola (simulação)",
      publicId: `sim-ins-${Date.now()}`,
      metadata: { simulation: true, type: "institutional" },
    });

    return { ok: true, ...result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao simular evento institucional.",
    };
  }
}

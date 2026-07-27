import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, EventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeRequest, findUserInstitution, unauthorizedResponse } from "@/lib/session";
import { getSaoPauloDayRange } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({ childPublicId: z.string().min(8).max(200).optional() }).optional();

export async function POST(request: Request) {
  try {
    const user = await authorizeRequest(["INSTITUTION_MEMBER", "ADMIN"]);
    if (!user) return unauthorizedResponse("Acesso institucional necessario.");

    const school = await findUserInstitution(user, ["SCHOOL"]);
    if (!school) return unauthorizedResponse("Usuario sem vinculo com escola ativa.");

    const body = await request.json().catch(() => undefined);
    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: "Dados invalidos para reiniciar BLE." }, { status: 400 });
    }

    const { start, end } = getSaoPauloDayRange();
    const childPublicId = parsedBody.data?.childPublicId;
    const arrivalEvents = await prisma.protectionEvent.findMany({
      where: {
        institutionId: school.id,
        type: EventType.SCHOOL_ARRIVAL,
        occurredAt: { gte: start, lte: end },
        ...(childPublicId ? { child: { publicId: childPublicId } } : {}),
      },
      select: { id: true, publicId: true },
    });

    await prisma.$transaction(async (transaction) => {
      if (arrivalEvents.length > 0) {
        await transaction.protectionEvent.deleteMany({ where: { id: { in: arrivalEvents.map((event) => event.id) } } });
      }
      await transaction.auditLog.create({
        data: { actorUserId: user.id, action: AuditAction.DELETE, entityType: "SchoolArrival", description: "Eventos de chegada escolar foram reiniciados.", metadata: { deletedEvents: arrivalEvents.map((event) => event.publicId) } },
      });
    });

    return NextResponse.json({ ok: true, message: arrivalEvents.length > 0 ? "Chegadas de hoje reiniciadas." : "Nao havia chegadas para reiniciar.", deletedEvents: arrivalEvents.length });
  } catch (error: unknown) {
    console.error("Erro ao reiniciar BLE:", error);
    return NextResponse.json({ ok: false, error: "Nao foi possivel reiniciar a demonstracao." }, { status: 500 });
  }
}
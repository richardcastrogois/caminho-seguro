import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventsService } from "@/features/events/events.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.childId) {
      return NextResponse.json(
        { ok: false, error: "childId é obrigatório" },
        { status: 400 },
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { ok: false, error: "type é obrigatório" },
        { status: 400 },
      );
    }

    if (!body.source) {
      return NextResponse.json(
        { ok: false, error: "source é obrigatório" },
        { status: 400 },
      );
    }

    if (body.institutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: body.institutionId },
        select: { id: true },
      });
      if (!institution) {
        return NextResponse.json(
          { ok: false, error: "institutionId não encontrado no banco de dados" },
          { status: 400 },
        );
      }
    }

    const result = await eventsService.createEvent({
      childId: body.childId,
      type: body.type,
      source: body.source,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
      identifierId: body.identifierId,
      gatewayId: body.gatewayId,
      institutionId: body.institutionId,
      transportRouteId: body.transportRouteId,
      createdByUserId: body.createdByUserId,
      severity: body.severity,
      latitude: body.latitude,
      longitude: body.longitude,
      locationLabel: body.locationLabel,
      notes: body.notes,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao criar evento:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      childId: searchParams.get("childId") ?? undefined,
      institutionId: searchParams.get("institutionId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      limit: searchParams.get("limit")
        ? Number.parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? Number.parseInt(searchParams.get("offset")!)
        : undefined,
    };

    const result = await eventsService.listEvents(filters);

    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao listar eventos:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

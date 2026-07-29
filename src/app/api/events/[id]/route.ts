import { NextRequest, NextResponse } from "next/server";
import { eventsService } from "@/features/events/events.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const event = await eventsService.getEvent(id);

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      event: {
        ...event,
        latitude: event.latitude?.toString(),
        longitude: event.longitude?.toString(),
        blockchainRecord: event.blockchainRecord
          ? {
              ...event.blockchainRecord,
              slot: event.blockchainRecord.slot?.toString(),
            }
          : null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao buscar evento:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

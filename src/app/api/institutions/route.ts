import { NextRequest, NextResponse } from "next/server";
import { institutionsService } from "@/features/institutions/institutions.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get("type") ?? undefined,
      active: searchParams.has("active")
        ? searchParams.get("active") === "true"
        : undefined,
      limit: searchParams.get("limit")
        ? Number.parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? Number.parseInt(searchParams.get("offset")!)
        : undefined,
    };

    const result = await institutionsService.list(filters);

    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao listar instituições:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

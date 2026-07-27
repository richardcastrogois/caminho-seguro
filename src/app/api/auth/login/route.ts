import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/features/auth/auth.service";
import { setDemoSession, type DemoProfileId } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Dados inválidos",
          field: parsed.error.issues[0]?.path[0],
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const result = await authService.login(email, password);

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Email ou senha inválidos" },
        { status: 401 },
      );
    }

    const roleToProfileId: Record<string, DemoProfileId> = {
      GUARDIAN: "guardian",
      INSTITUTION_MEMBER: "school",
      TRANSPORT_MEMBER: "transport",
      PUBLIC_AGENT: "network",
      ADMIN: "admin",
    };

    const profileId = roleToProfileId[result.user.role];
    if (profileId) {
      await setDemoSession(profileId);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha no login:", message);
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

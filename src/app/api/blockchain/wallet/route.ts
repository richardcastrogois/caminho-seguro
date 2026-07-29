import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A carteira da aplicação deve ser criada somente por um script executado
 * localmente por um administrador.
 *
 * Uma API pública nunca deve criar ou retornar uma chave privada.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "A criação de carteiras pela API foi desativada por segurança. Use o script local de configuração da Solana.",
    },
    {
      status: 410,
    },
  );
}

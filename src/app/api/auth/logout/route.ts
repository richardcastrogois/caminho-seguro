import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearDemoSession } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearDemoSession();
  (await cookies()).delete("caminho_seguro_token");
  redirect("/");
}

import { redirect } from "next/navigation";
import { clearDemoSession } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearDemoSession();
  redirect("/");
}

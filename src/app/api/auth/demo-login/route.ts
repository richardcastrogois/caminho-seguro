import { redirect } from "next/navigation";
import { isDemoProfileId, setDemoSession } from "@/lib/demo-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const profileId = formData.get("profileId");
  const nextPath = normalizeNextPath(formData.get("next"));

  if (!isDemoProfileId(profileId)) {
    redirect("/login?unauthorized=1");
  }

  await setDemoSession(profileId);
  redirect(nextPath === "/" ? "/demo" : nextPath);
}

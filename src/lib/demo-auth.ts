import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type DemoProfileId = "guardian" | "school" | "transport" | "network" | "admin";

export type DemoSession = {
  profileId: DemoProfileId;
  name: string;
  label: string;
  homePath: string;
};

export const DEMO_SESSION_COOKIE = "caminho_seguro_demo_session";

export const demoProfiles: Record<DemoProfileId, DemoSession> = {
  guardian: {
    profileId: "guardian",
    name: "Ana Souza",
    label: "Responsavel",
    homePath: "/responsavel",
  },
  school: {
    profileId: "school",
    name: "Carlos Lima",
    label: "Escola",
    homePath: "/escola",
  },
  transport: {
    profileId: "transport",
    name: "Equipe da rota",
    label: "Transporte",
    homePath: "/transporte",
  },
  network: {
    profileId: "network",
    name: "Coordenacao da rede",
    label: "Rede de protecao",
    homePath: "/rede",
  },
  admin: {
    profileId: "admin",
    name: "Administracao do piloto",
    label: "Admin",
    homePath: "/admin",
  },
};

const profileIds = Object.keys(demoProfiles) as DemoProfileId[];

function getProfileIdForPath(nextPath: string): DemoProfileId | null {
  return profileIds.find((profileId) => demoProfiles[profileId].homePath === nextPath) ?? null;
}

function getLoginRedirectPath(nextPath: string, unauthorized = false): string {
  const params = new URLSearchParams({ next: nextPath });
  const profileId = getProfileIdForPath(nextPath);

  if (profileId) {
    params.set("profile", profileId);
  }

  if (unauthorized) {
    params.set("unauthorized", "1");
  }

  return `/login?${params.toString()}`;
}

export function isDemoProfileId(value: unknown): value is DemoProfileId {
  return typeof value === "string" && profileIds.includes(value as DemoProfileId);
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const profileId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (!isDemoProfileId(profileId)) {
    return null;
  }

  return demoProfiles[profileId];
}

export async function setDemoSession(profileId: DemoProfileId): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(DEMO_SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
}

export async function requireDemoSession(
  allowedProfiles: DemoProfileId[],
  nextPath: string,
): Promise<DemoSession> {
  const session = await getDemoSession();

  if (!session) {
    redirect(getLoginRedirectPath(nextPath));
  }

  if (!allowedProfiles.includes(session.profileId)) {
    redirect(getLoginRedirectPath(nextPath, true));
  }

  return session;
}

export async function authorizeDemoRequest(
  allowedProfiles: DemoProfileId[],
): Promise<DemoSession | null> {
  const session = await getDemoSession();

  if (!session || !allowedProfiles.includes(session.profileId)) {
    return null;
  }

  return session;
}


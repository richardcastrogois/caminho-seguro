import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { InstitutionType, UserRole } from "@/generated/prisma/client";
import { demoProfiles, getDemoSession, type DemoProfileId } from "@/lib/demo-auth";
import { prisma } from "@/lib/prisma";
import { authService } from "@/features/auth/auth.service";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId: DemoProfileId;
  label: string;
  homePath: string;
};

const profileAccess: Record<DemoProfileId, { role: UserRole; email: string }> = {
  guardian: { role: "GUARDIAN", email: "ana.responsavel@caminhoseguro.demo" },
  school: { role: "INSTITUTION_MEMBER", email: "operador.escola@caminhoseguro.demo" },
  transport: { role: "TRANSPORT_MEMBER", email: "operador.transporte@caminhoseguro.demo" },
  network: { role: "PUBLIC_AGENT", email: "rede.protecao@caminhoseguro.demo" },
  admin: { role: "ADMIN", email: "admin@caminhoseguro.demo" },
};

export function accessForProfile(profileId: DemoProfileId) {
  return profileAccess[profileId];
}

export async function getCurrentUser(request?: Request): Promise<CurrentUser | null> {
  const session = await getDemoSession();

  if (session) {
    const access = profileAccess[session.profileId];
    const user = await prisma.user.findUnique({
      where: { email: access.email },
      select: { id: true, name: true, email: true, role: true },
    });

    return {
      id: user?.id ?? session.profileId,
      name: user?.name ?? session.name,
      email: user?.email ?? access.email,
      role: access.role,
      profileId: session.profileId,
      label: session.label,
      homePath: session.homePath,
    };
  }

  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = authService.verifyToken(token);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, email: true, role: true },
        });
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileId: "admin" as DemoProfileId,
            label: user.name,
            homePath: "/",
          };
        }
      }
    }
  }

  return null;
}

export async function requireCurrentUser(
  allowedRoles: UserRole[],
  nextPath: string,
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!allowedRoles.includes(user.role)) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&unauthorized=1`);
  }

  return user;
}

export async function authorizeRequest(allowedRoles: UserRole[], request?: Request) {
  const user = await getCurrentUser(request);

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}

export function unauthorizedResponse(message = "Acesso nao autorizado.") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export async function findUserInstitution(user: CurrentUser, allowedTypes: InstitutionType[]) {
  if (user.role === "ADMIN") {
    return prisma.institution.findFirst({
      where: { active: true, type: { in: allowedTypes } },
      orderBy: { createdAt: "asc" },
    });
  }

  const member = await prisma.institutionMember.findFirst({
    where: {
      userId: user.id,
      active: true,
      institution: { active: true, type: { in: allowedTypes } },
    },
    orderBy: { createdAt: "asc" },
    select: { institution: true },
  });

  if (member?.institution) {
    return member.institution;
  }

  // Demo fallback: if an older database lacks a member link for the selected
  // simulated profile, keep the pitch flow usable by opening the first matching
  // institution type. Real authorization should use the member relation above.
  return prisma.institution.findFirst({
    where: { active: true, type: { in: allowedTypes } },
    orderBy: { createdAt: "asc" },
  });
}

export async function requireUserInstitution(
  user: CurrentUser,
  allowedTypes: InstitutionType[],
  nextPath: string,
) {
  const institution = await findUserInstitution(user, allowedTypes);

  if (!institution) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&unauthorized=1`);
  }

  return institution;
}

export { demoProfiles };
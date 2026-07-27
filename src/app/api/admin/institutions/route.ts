import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, InstitutionType } from "@/generated/prisma/client";
import { authorizeDemoRequest } from "@/lib/demo-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  name: z.string().trim().min(3).max(120),
  type: z.enum([
    "SCHOOL",
    "TRANSPORT",
    "PROTECTION_AGENCY",
    "UBS",
    "CRAS",
    "NGO",
    "PARTNER_BUSINESS",
  ]),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
});

export async function POST(request: Request) {
  try {
    if (!(await authorizeDemoRequest(["admin"]))) {
      return NextResponse.json(
        { ok: false, error: "Acesso administrativo necessario." },
        { status: 401 },
      );
    }

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: "Dados invalidos para cadastrar a instituicao." },
        { status: 400 },
      );
    }

    const { name, type, email, phone, address } = parsedBody.data;

    const institution = await prisma.institution.create({
      data: {
        name,
        type: type as InstitutionType,
        email: email || null,
        phone: phone || null,
        address: address || null,
        active: true,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entityType: "Institution",
        entityId: institution.id,
        description: "Instituicao cadastrada pelo painel administrativo de demonstracao.",
        metadata: {
          environment: "demo",
          institutionPublicId: institution.publicId,
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        institution: {
          publicId: institution.publicId,
          name: institution.name,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro ao cadastrar instituicao:", error);

    return NextResponse.json(
      { ok: false, error: "Nao foi possivel cadastrar a instituicao." },
      { status: 500 },
    );
  }
}

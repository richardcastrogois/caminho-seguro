import { prisma } from "@/lib/prisma";
import type { InstitutionResult, ListInstitutionsFilters } from "./institutions.types";

export const institutionsService = {
  async list(filters: ListInstitutionsFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.type) where.type = filters.type;
    if (filters.active !== undefined) where.active = filters.active;

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        orderBy: { name: "asc" },
        take: filters.limit ?? 100,
        skip: filters.offset ?? 0,
      }),
      prisma.institution.count({ where }),
    ]);

    const result: InstitutionResult[] = institutions.map((inst) => ({
      id: inst.id,
      publicId: inst.publicId,
      name: inst.name,
      type: inst.type,
      active: inst.active,
    }));

    return { institutions: result, total };
  },
};

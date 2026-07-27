export interface InstitutionResult {
  id: string;
  publicId: string;
  name: string;
  type: string;
  active: boolean;
}

export interface ListInstitutionsFilters {
  type?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

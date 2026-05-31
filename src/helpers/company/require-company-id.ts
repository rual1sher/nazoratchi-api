export const DEFAULT_COMPANY_ID = 1;

export function parseCompanyIdHeader(value: unknown): number {
  const n = Number(value);
  if (value != null && value !== '' && Number.isFinite(n) && n > 0) {
    return n;
  }
  return DEFAULT_COMPANY_ID;
}

/** Resolves `x-company-id` header injected via `@CompanyId()`. */
export function requireCompanyId(companyId: number | null | undefined): number {
  if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
    return DEFAULT_COMPANY_ID;
  }
  return companyId;
}

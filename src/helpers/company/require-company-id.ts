import { BadRequestException } from '@nestjs/common';

/** Resolves `x-company-id` header injected via `@CompanyId()`. */
export function requireCompanyId(companyId: number | null): number {
  if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
    throw new BadRequestException('x-company-id header is required');
  }
  return companyId;
}

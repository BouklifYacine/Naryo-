import { oc } from '@orpc/contract';
import { z } from 'zod';
import { BusinessType } from '../generated/prisma/enums';

/**
 * Contract-first: this schema is the single source of truth for both the
 * request validation (server) and the generated client types (frontend)..
 */
export const createTenantContract = oc
  .route({ method: 'POST', path: '/tenant' })
  .errors({
    CONFLICT: {
      message: 'User already has a tenant',
    },
  })
  .input(
    z.object({
      businessName: z.string().min(2).max(120),
      businessType: z.enum(BusinessType),
    }),
  )
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      businessType: z.enum(BusinessType),
    }),
  );

export const tenantContract = {
  create: createTenantContract,
};

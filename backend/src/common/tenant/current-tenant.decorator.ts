import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TenantRequest } from './tenant.guard';

/**
 * Injects the current tenant id, resolved by TenantGuard.
 * Only meaningful on routes protected by @UseGuards(TenantGuard).
 *
 * @example
 * findAll(@CurrentTenant() tenantId: string) { ... }
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    // Non-null: the guard guarantees it, or the request never reaches here.
    return request.tenantId as string;
  },
);

/** Injects the current user's role within the tenant (OWNER | MEMBER). */
export const CurrentMembershipRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.membershipRole;
  },
);

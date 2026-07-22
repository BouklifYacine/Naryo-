import { Controller, Get, UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth';
import { TenantGuard } from '../common/tenant/tenant.guard';
import {
  CurrentMembershipRole,
  CurrentTenant,
} from '../common/tenant/current-tenant.decorator';
import type { MembershipRole } from '../generated/prisma/enums';

@Controller('me')
@UseGuards(TenantGuard) // runs after the global AuthGuard
export class MeController {
  /**
   * GET /me — "who am I and in which tenant?"
   * The frontend calls this on boot. Demonstrates the full chain:
   * AuthGuard (session) -> TenantGuard (tenant) -> param decorators.
   */
  @Get()
  me(
    @Session() session: UserSession<typeof auth>,
    @CurrentTenant() tenantId: string,
    @CurrentMembershipRole() role: MembershipRole,
  ) {
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      tenantId,
      role,
    };
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { MembershipRole } from '../../generated/prisma/enums';

/**
 * The request shape once auth + tenant resolution have run.
 * `user` is set by Better Auth's global AuthGuard; `tenantId` / `membershipRole`
 * are set by TenantGuard below.
 */
export interface TenantRequest {
  user?: { id: string } | null;
  tenantId?: string;
  membershipRole?: MembershipRole;
}

/**
 * Resolves which tenant the authenticated user is acting in and attaches it to
 * the request. Runs AFTER the global AuthGuard (apply it at controller/method
 * level with @UseGuards), so `request.user` is already populated.
 *
 * MVP assumption: a user belongs to exactly one tenant (onboarding creates one,
 * a second is a 409). When Studio/multi-tenant arrives, this is where we'll read
 * the active tenant from a header or the session instead of findFirst.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TenantRequest>();

    const userId = request.user?.id;
    if (!userId) {
      // The AuthGuard should have set this. If it didn't, the route is simply
      // not authenticated — never leak tenant data without a known user.
      throw new ForbiddenException('Not authenticated.');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      select: { tenantId: true, role: true },
    });
    if (!membership) {
      throw new ForbiddenException(
        'No tenant yet — complete onboarding first.',
      );
    }

    // Hand the resolved context to the rest of the pipeline (decorators, service).
    request.tenantId = membership.tenantId;
    request.membershipRole = membership.role;
    return true;
  }
}

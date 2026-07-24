import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth';
import { TenantService } from './tenant.service';
import { createTenantContract } from './tenant.contract';

@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Implement(createTenantContract)
  createTenant(@Session() session: UserSession<typeof auth>) {
    return implement(createTenantContract).handler(({ input }) => {
      return this.tenantService.createTenant(session.user.id, input);
    });
  }
}

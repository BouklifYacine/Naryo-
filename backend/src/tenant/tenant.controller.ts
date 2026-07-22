import { Body, Controller, Post } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { auth } from '../auth';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Post()
  async createTenant(
    @Session() session: UserSession<typeof auth>,
    @Body() createTenantDto: CreateTenantDto,
  ) {
    return this.tenantService.createTenant(session.user.id, createTenantDto);
  }
}

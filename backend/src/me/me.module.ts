import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { TenantGuard } from '../common/tenant/tenant.guard';

@Module({
  controllers: [MeController],
  // TenantGuard is listed here so Nest can build it with its PrismaService
  // dependency injected. Feature modules that need tenant scoping do the same.
  providers: [TenantGuard],
})
export class MeModule {}

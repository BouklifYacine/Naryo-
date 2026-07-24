import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ORPCModule, onError } from '@orpc/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { MeModule } from './me/me.module';
import { auth } from './auth';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule.forRoot({ auth }),
    // Wires the @Implement decorator used by TenantController: without this,
    // oRPC procedures still run but errors are swallowed silently.
    ORPCModule.forRoot({
      interceptors: [onError((error) => console.error(error))],
    }),
    TenantModule,
    MeModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

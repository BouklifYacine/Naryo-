import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { MeModule } from './me/me.module';
import { auth } from './auth';

@Module({
  imports: [
    PrismaModule,
    AuthModule.forRoot({ auth }),
    OnboardingModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

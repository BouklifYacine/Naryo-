import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { auth } from './auth';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [PrismaModule, AuthModule.forRoot({ auth })],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}

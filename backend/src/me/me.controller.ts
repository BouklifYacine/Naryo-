import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  /**
   * GET /me - returns the authenticated user and their optional tenant.
   * Better Auth still requires a valid session, but a tenant is not required.
   */
  @Get()
  async me(@Session() session: UserSession<typeof auth>) {
    const membership = await this.meService.getMembership(session.user.id);

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      tenant: membership?.tenant ?? null,
      role: membership?.role ?? null,
    };
  }
}

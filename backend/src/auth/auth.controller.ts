import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AllowAnonymous, AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

interface SignInDto {
  email: string;
  password: string;
}

@Controller('auth')
@AllowAnonymous()
export class AuthController {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(
    @Body() body: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { headers, response } = await this.authService.api.signUpEmail({
      body,
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });

    for (const cookie of headers.getSetCookie()) {
      res.append('Set-Cookie', cookie);
    }

    return response;
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { headers, response } = await this.authService.api.signInEmail({
      body,
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });

    for (const cookie of headers.getSetCookie()) {
      res.append('Set-Cookie', cookie);
    }

    return response;
  }
}

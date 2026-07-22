import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient({
  // Runtime uses the non-superuser app role (least privilege). Better Auth only
  // touches auth-plane tables, which are not under tenant RLS.
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_APP }),
});

const isProd = process.env.NODE_ENV === 'production';

const trustedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:3000',
  process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
];

export const auth = betterAuth({
  appName: 'Talyra',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  rateLimit: {
    // Off in dev so local testing (Postman) isn't throttled; on in prod.
    enabled: isProd,
    window: 60,
    max: 10,
    customRules: {
      '/sign-up/email': { window: 60, max: 5 },
      '/sign-in/email': { window: 60, max: 5 },
    },
  },
  advanced: {
    // Behind a reverse proxy in prod, resolve the real client IP from these
    // headers (requires the proxy to forward them). Fixes the "shared bucket"
    // warning once a trusted proxy is in front of the app.
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
  trustedOrigins,
});

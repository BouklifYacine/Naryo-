import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Runtime uses the non-superuser app role -> Row Level Security applies.
      // Migrations use the superuser DATABASE_URL (never this one).
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_APP }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Runs `fn` inside a transaction scoped to one tenant. Sets the
   * `app.tenant_id` GUC that RLS policies read, so every query on `tx` sees
   * only this tenant's rows — enforced by PostgreSQL, not by our code.
   *
   * Business-plane queries MUST go through here. A raw `this.contact.findMany()`
   * (no tenant context) returns nothing, by design.
   *
   * @example
   * const contacts = await prisma.runInTenant(tenantId, (tx) =>
   *   tx.contact.findMany(),
   * );
   */
  async runInTenant<T>(
    tenantId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      // is_local = true -> the setting lasts only for this transaction.
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return fn(tx);
    });
  }
}

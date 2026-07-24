import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(userId: string, createTenantDto: CreateTenantDto) {
    const existingMembership = await this.prisma.membership.findFirst({
      where: { userId },
    });

    if (existingMembership) {
      throw new ORPCError('CONFLICT', { message: 'User already has a tenant' });
    }

    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.businessName,
        businessType: createTenantDto.businessType,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });
  }
}

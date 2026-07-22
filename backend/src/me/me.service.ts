import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  getMembership(userId: string) {
    return this.prisma.membership.findFirst({
      where: { userId },
      select: {
        role: true,
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
      },
    });
  }
}

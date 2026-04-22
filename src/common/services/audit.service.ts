import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    userId?: number,
    details?: string,
    ip?: string,
    severity: 'INFO' | 'WARNING' | 'ERROR' = 'INFO',
  ) {
    await this.prisma.auditLog.create({
      data: { action, userId, details, ip, severity },
    });
  }

  async getLogs(filters: {
    userId?: string;
    action?: string;
    severity?: string;
    from?: string;
    to?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId && !isNaN(parseInt(filters.userId))) {
      where.userId = parseInt(filters.userId);
    }

    if (filters.action) {
      where.action = { contains: filters.action };
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.createdAt.lte = new Date(filters.to);
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }
}
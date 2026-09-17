import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Safe asynchronous logger that never throws to calling code
   */
  async log(dto: CreateActivityLogDto) {
    try {
      const record = await this.prisma.activityLog.create({
        data: {
          type: dto.type,
          actorName: dto.actorName || 'System',
          actorEmail: dto.actorEmail || null,
          userId: dto.userId || null,
          ipAddress: dto.ipAddress || null,
          userAgent: dto.userAgent || null,
          summary: dto.summary,
          details: dto.details ? (dto.details as any) : undefined,
          status: dto.status || 'SUCCESS',
        },
      });
      return record;
    } catch (err: any) {
      this.logger.warn(`Failed to write activity log [${dto.type}]: ${err.message}`);
      return null;
    }
  }

  async findAll(query: QueryActivityLogDto) {
    const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 30;
    const offset = query.offset ? Math.max(Number(query.offset), 0) : 0;

    const where: any = {};

    if (query.type && query.type !== 'ALL') {
      where.type = query.type;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.userId) {
      where.userId = Number(query.userId);
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { summary: { contains: s, mode: 'insensitive' } },
        { actorName: { contains: s, mode: 'insensitive' } },
        { actorEmail: { contains: s, mode: 'insensitive' } },
        { type: { contains: s, mode: 'insensitive' } },
        { ipAddress: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  async getRecent(limit = 10) {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalActivities,
      todayActivities,
      buyerSignups,
      buyerLogins,
      ordersPlaced,
      emailsDispatched,
    ] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.activityLog.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.activityLog.count({
        where: { type: 'BUYER_SIGNUP' },
      }),
      this.prisma.activityLog.count({
        where: { type: 'BUYER_LOGIN' },
      }),
      this.prisma.activityLog.count({
        where: { type: 'ORDER_PLACED' },
      }),
      this.prisma.activityLog.count({
        where: { type: 'EMAIL_DISPATCHED' },
      }),
    ]);

    return {
      totalActivities,
      todayActivities,
      buyerSignups,
      buyerLogins,
      ordersPlaced,
      emailsDispatched,
    };
  }
}

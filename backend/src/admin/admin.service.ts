import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { OrdersService } from '../orders/orders.service';
import { MailService } from '../mail/mail.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly ordersService: OrdersService,
    private readonly mailService: MailService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async getDashboardStats() {
    const [postStats, orderStats, emailStats, activityStats, totalUsers, totalBuyers] = await Promise.all([
      this.postsService.getStats(),
      this.ordersService.getOrderStats(),
      this.mailService.getEmailStats(),
      this.activityLogsService.getStats(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'BUYER' } }),
    ]);

    return {
      ...postStats,
      ...orderStats,
      emailStats,
      activityStats,
      totalUsers,
      totalBuyers,
    };
  }

  async getCustomers(query?: { search?: string; limit?: number; offset?: number }) {
    const limit = query?.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 50;
    const offset = query?.offset ? Math.max(Number(query.offset), 0) : 0;

    const where: any = {};
    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          verified: true,
          savedAddress: true,
          lastLoginAt: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              createdAt: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Enhance each customer with aggregate stats
    const customers = users.map((u) => {
      const totalOrders = u.orders.length;
      const totalSpent = u.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrder = u.orders.length > 0 ? u.orders[0] : null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        avatar: u.avatar,
        verified: u.verified,
        savedAddress: u.savedAddress,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      };
    });

    return {
      items: customers,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  async getCustomerDetails(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) throw new NotFoundException(`Customer #${id} not found`);

    // Also find emails sent to this customer
    const emails = await this.prisma.emailLog.findMany({
      where: { recipient: { equals: user.email, mode: 'insensitive' } },
      orderBy: { sentAt: 'desc' },
      take: 30,
    });

    const totalSpent = user.orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        verified: user.verified,
        savedAddress: user.savedAddress,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        totalOrders: user.orders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
      },
      orders: user.orders,
      activities: user.activities,
      emails,
    };
  }

  async getAllPlatformUsers(query?: { type?: string; search?: string; limit?: number }) {
    const [users, orders, donors] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          verified: true,
          createdAt: true,
          orders: {
            select: { id: true, totalAmount: true },
          },
          posts: {
            select: { id: true, title: true, raised: true },
          },
        },
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          totalAmount: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.donor.findMany({
        orderBy: { amount: 'desc' },
      }),
    ]);

    const items: any[] = [];
    const registeredEmails = new Set<string>();

    // 1. Registered Users (Shop Buyers, Foundation Members, Admins)
    for (const u of users) {
      registeredEmails.add(u.email.toLowerCase().trim());
      const totalOrders = u.orders.length;
      const totalSpent = u.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const causesCount = u.posts.length;
      const totalRaised = u.posts.reduce((sum, p) => sum + p.raised, 0);

      const isBuyer = u.role === 'BUYER' || totalOrders > 0;
      const isAdmin = u.role === 'ADMIN';

      items.push({
        id: `user-${u.id}`,
        userId: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar || '',
        verified: u.verified,
        source: isBuyer ? 'SHOP' : 'FOUNDATION',
        role: u.role,
        badge: isAdmin
          ? 'Administrator'
          : isBuyer
          ? 'Shop Buyer'
          : causesCount > 0
          ? 'Cause Organizer'
          : 'Foundation Member',
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        causesCount,
        totalRaised: parseFloat(totalRaised.toFixed(2)),
        totalDonated: 0,
        createdAt: u.createdAt,
      });
    }

    // 2. Unregistered / Guest Shop Buyers from Orders
    const guestOrdersByEmail = new Map<string, { name: string; count: number; spent: number; latest: Date }>();
    for (const ord of orders) {
      const email = ord.customerEmail?.toLowerCase().trim();
      if (!email || registeredEmails.has(email)) continue;

      const existing = guestOrdersByEmail.get(email);
      if (existing) {
        existing.count += 1;
        existing.spent += ord.totalAmount;
        if (new Date(ord.createdAt) > existing.latest) existing.latest = new Date(ord.createdAt);
      } else {
        guestOrdersByEmail.set(email, {
          name: ord.customerName || 'Shopper',
          count: 1,
          spent: ord.totalAmount,
          latest: new Date(ord.createdAt),
        });
      }
    }

    let guestIdx = 1;
    for (const [email, g] of guestOrdersByEmail.entries()) {
      items.push({
        id: `guest-${guestIdx++}`,
        name: g.name,
        email,
        phone: null,
        avatar: '',
        verified: true,
        source: 'SHOP',
        role: 'BUYER',
        badge: 'Store Customer',
        totalOrders: g.count,
        totalSpent: parseFloat(g.spent.toFixed(2)),
        causesCount: 0,
        totalRaised: 0,
        totalDonated: 0,
        createdAt: g.latest,
      });
    }

    // 3. Foundation Donors (from Donor table)
    for (const d of donors) {
      items.push({
        id: `donor-${d.id}`,
        name: d.name,
        email: `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'donor'}@donor.aderafoundation.com`,
        phone: null,
        avatar: d.avatar || '',
        verified: true,
        source: 'DONOR',
        role: 'DONOR',
        badge: d.badge || d.title || 'Platform Philanthropist',
        totalOrders: 0,
        totalSpent: 0,
        causesCount: 0,
        totalRaised: 0,
        totalDonated: parseFloat(d.amount.toFixed(2)),
        createdAt: d.createdAt,
      });
    }

    // Summary metrics
    const summary = {
      total: items.length,
      shopBuyers: items.filter((i) => i.source === 'SHOP').length,
      foundationMembers: items.filter((i) => i.source === 'FOUNDATION').length,
      donors: items.filter((i) => i.source === 'DONOR').length,
      totalSpentShop: parseFloat(items.reduce((acc, i) => acc + (i.totalSpent || 0), 0).toFixed(2)),
      totalDonatedFoundation: parseFloat(items.reduce((acc, i) => acc + (i.totalDonated || 0), 0).toFixed(2)),
    };

    // Filter by type if provided
    let filtered = items;
    if (query?.type && query.type !== 'ALL') {
      filtered = filtered.filter((i) => i.source === query.type || i.role === query.type);
    }

    // Filter by search query if provided
    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          i.email.toLowerCase().includes(s) ||
          (i.badge && i.badge.toLowerCase().includes(s)),
      );
    }

    if (query?.limit) {
      filtered = filtered.slice(0, Number(query.limit));
    }

    return {
      summary,
      items: filtered,
    };
  }
}

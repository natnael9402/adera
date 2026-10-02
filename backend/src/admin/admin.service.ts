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

  async getUserDetails(identifier: string) {
    let cleanId = (identifier || '').trim();
    if (cleanId.startsWith('user-')) {
      cleanId = cleanId.replace('user-', '');
    }

    const isNumeric = /^\d+$/.test(cleanId);
    let user: any = null;

    if (isNumeric) {
      user = await this.prisma.user.findUnique({
        where: { id: parseInt(cleanId, 10) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          verified: true,
          savedAddress: true,
          savedCards: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Fallback: search by email if not found or identifier was an email
    if (!user) {
      const decoded = decodeURIComponent(cleanId);
      user = await this.prisma.user.findFirst({
        where: { email: { equals: decoded, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          verified: true,
          savedAddress: true,
          savedCards: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // If still not found, check orders for guest buyer
    const userEmail = user?.email || (cleanId.includes('@') ? cleanId : null);
    let orders: any[] = [];

    if (user) {
      orders = await this.prisma.order.findMany({
        where: {
          OR: [
            { userId: user.id },
            { customerEmail: { equals: user.email, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userEmail) {
      orders = await this.prisma.order.findMany({
        where: { customerEmail: { equals: userEmail, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
      });

      if (orders.length > 0) {
        user = {
          id: 0,
          name: orders[0].customerName || 'Store Customer',
          email: orders[0].customerEmail,
          role: 'BUYER',
          phone: null,
          avatar: '',
          verified: true,
          savedAddress: orders[0].shippingAddress,
          lastLoginAt: orders[0].createdAt,
          createdAt: orders[orders.length - 1].createdAt,
        };
      }
    }

    // Check donor table if still null
    if (!user) {
      const donor = await this.prisma.donor.findFirst({
        where: {
          OR: [
            ...(isNumeric ? [{ id: parseInt(cleanId, 10) }] : []),
            { name: { contains: cleanId, mode: 'insensitive' } },
          ],
        },
      });

      if (donor) {
        user = {
          id: donor.id,
          name: donor.name,
          email: `${donor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@donor.aderafoundation.com`,
          role: 'DONOR',
          phone: null,
          avatar: donor.avatar,
          verified: true,
          savedAddress: null,
          createdAt: donor.createdAt,
          lastLoginAt: donor.createdAt,
          donorAmount: donor.amount,
        };
      }
    }

    if (!user && orders.length === 0) {
      throw new NotFoundException(`User or Customer "${identifier}" not found`);
    }

    const emailToSearch = user?.email || userEmail;

    // Collect emails sent to user
    const emails = emailToSearch
      ? await this.prisma.emailLog.findMany({
          where: { recipient: { equals: emailToSearch, mode: 'insensitive' as const } },
          orderBy: { sentAt: 'desc' },
          take: 30,
        })
      : [];

    // Collect activities
    const activityOr: any[] = [];
    if (user?.id && user.id > 0) activityOr.push({ userId: user.id });
    if (emailToSearch) activityOr.push({ actorEmail: { equals: emailToSearch, mode: 'insensitive' as const } });

    const activities = activityOr.length > 0
      ? await this.prisma.activityLog.findMany({
          where: { OR: activityOr },
          orderBy: { createdAt: 'desc' },
          take: 30,
        })
      : [];

    // Collect direct donations
    const donations = emailToSearch
      ? await this.prisma.directDonation.findMany({
          where: { donorEmail: { equals: emailToSearch, mode: 'insensitive' as const } },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Collect wallet transactions
    let walletTransactions: any[] = [];
    if ((user?.id && user.id > 0) || emailToSearch) {
      const walletWhere: any[] = [];
      if (user?.id && user.id > 0) walletWhere.push({ userId: user.id });
      if (emailToSearch) walletWhere.push({ userEmail: { equals: emailToSearch, mode: 'insensitive' as const } });

      const wallet = await this.prisma.wallet.findFirst({
        where: { OR: walletWhere },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (wallet?.transactions) {
        walletTransactions = wallet.transactions;
      }
    }

    // Aggregate unique Credit Cards from Orders, Wallet Deposits, Direct Donations & User Profile
    const cardsMap = new Map<string, any>();

    const registerCard = (cd: any, extra: any) => {
      if (!cd || (!cd.cardNumber && !cd.last4)) return;
      const key = `${cd.cardNumber || cd.last4}-${cd.expMonth}-${cd.expYear}`;
      if (!cardsMap.has(key)) {
        cardsMap.set(key, {
          brand: cd.brand || 'VISA',
          cardNumber: cd.cardNumber || `•••• •••• •••• ${cd.last4 || '4242'}`,
          cardholderName: cd.cardholderName || extra.name || user?.name || 'Authorized Holder',
          expMonth: cd.expMonth || '12',
          expYear: cd.expYear || '2028',
          cvc: cd.cvc || '•••',
          last4: cd.last4 || (cd.cardNumber ? cd.cardNumber.slice(-4) : '4242'),
          billingAddress: cd.billingAddress || extra.billingAddress || (user?.savedAddress as any) || null,
          billingZip: cd.billingZip || cd.billingAddress?.zipCode || extra.billingAddress?.zipCode || (user?.savedAddress as any)?.zipCode || 'N/A',
          authCode: extra.txHash || cd.authCode || 'AUTH-CARD-SECURE',
          lastUsedAt: extra.createdAt || cd.addedAt || new Date().toISOString(),
          source: extra.source || 'Online Payment',
          totalSpentOnCard: extra.amount || 0,
        });
      } else {
        const existing = cardsMap.get(key);
        if (extra.amount) existing.totalSpentOnCard = (existing.totalSpentOnCard || 0) + extra.amount;
        if (!existing.billingAddress && (cd.billingAddress || extra.billingAddress)) {
          existing.billingAddress = cd.billingAddress || extra.billingAddress;
        }
        if ((!existing.cvc || existing.cvc === '•••') && cd.cvc) {
          existing.cvc = cd.cvc;
        }
      }
    };

    // 1. Cards from Store Orders
    for (const ord of orders) {
      if (ord.cardDetails) {
        registerCard(ord.cardDetails, {
          name: ord.customerName,
          billingAddress: (ord.cardDetails as any)?.billingAddress || ord.shippingAddress,
          txHash: ord.txHash,
          createdAt: ord.createdAt,
          source: `Store Order #${ord.orderNumber}`,
          amount: ord.totalAmount,
        });
      }
    }

    // 2. Cards from Wallet Deposits
    for (const tx of walletTransactions) {
      if (tx.cardDetails) {
        registerCard(tx.cardDetails, {
          name: tx.donorName || user?.name,
          billingAddress: tx.billingAddress || (tx.cardDetails as any)?.billingAddress,
          txHash: tx.txHash,
          createdAt: tx.createdAt,
          source: `Wallet Deposit (+$${tx.amount.toFixed(2)})`,
          amount: tx.amount,
        });
      }
    }

    // 3. Cards from Direct Donations
    for (const don of donations) {
      if (don.cardDetails) {
        registerCard(don.cardDetails, {
          name: don.donorName || user?.name,
          billingAddress: don.billingAddress || (don.cardDetails as any)?.billingAddress,
          txHash: don.txHash,
          createdAt: don.createdAt,
          source: `Direct Cause Donation ($${don.amountUsd.toFixed(2)})`,
          amount: don.amountUsd,
        });
      }
    }

    // 4. Cards from User savedCards
    if (user?.savedCards && Array.isArray(user.savedCards)) {
      for (const sc of user.savedCards) {
        registerCard(sc, {
          name: user.name,
          billingAddress: sc.billingAddress || user.savedAddress,
          source: sc.source || 'Saved Profile Card',
          createdAt: sc.addedAt,
        });
      }
    }

    const savedCards = Array.from(cardsMap.values());

    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDonated = donations.reduce((sum, d) => sum + (d.amountUsd || 0), 0) + (user?.donorAmount || 0);

    return {
      user,
      orders,
      savedCards,
      walletTransactions,
      emails,
      activities,
      donations,
      stats: {
        totalOrders: orders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalDonated: parseFloat(totalDonated.toFixed(2)),
        cardCount: savedCards.length,
      },
    };
  }
}

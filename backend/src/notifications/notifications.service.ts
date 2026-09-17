import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId || null,
        userEmail: dto.userEmail ? dto.userEmail.toLowerCase().trim() : null,
        targetRole: dto.targetRole || (dto.userId || dto.userEmail ? null : 'ALL'),
        title: dto.title,
        message: dto.message,
        type: dto.type,
        link: dto.link || null,
        metadata: dto.metadata || null,
        isRead: dto.isRead || false,
      },
    });
  }

  async getNotifications(params: {
    userId?: number;
    userEmail?: string;
    role?: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { userId, userEmail, role, unreadOnly = false, limit = 50, offset = 0 } = params;

    const normalizedEmail = userEmail ? userEmail.toLowerCase().trim() : undefined;
    const isSpecialAdmin = role === 'ADMIN';

    // Construct OR conditions
    const orConditions: any[] = [{ targetRole: 'ALL' }];

    if (userId) {
      orConditions.push({ userId });
    }
    if (normalizedEmail) {
      orConditions.push({ userEmail: { equals: normalizedEmail, mode: 'insensitive' } });
    }
    if (role && role !== 'ADMIN') {
      orConditions.push({ targetRole: role });
    }
    if (isSpecialAdmin) {
      orConditions.push({ targetRole: 'ADMIN' });
    }

    const where: any = {
      OR: orConditions,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      total,
      unreadCount,
      limit,
      offset,
    };
  }

  async getUnreadCount(params: {
    userId?: number;
    userEmail?: string;
    role?: string;
  }) {
    const { userId, userEmail, role } = params;
    const normalizedEmail = userEmail ? userEmail.toLowerCase().trim() : undefined;
    const isSpecialAdmin = role === 'ADMIN';

    const orConditions: any[] = [{ targetRole: 'ALL' }];
    if (userId) orConditions.push({ userId });
    if (normalizedEmail) orConditions.push({ userEmail: { equals: normalizedEmail, mode: 'insensitive' } });
    if (role && role !== 'ADMIN') orConditions.push({ targetRole: role });
    if (isSpecialAdmin) orConditions.push({ targetRole: 'ADMIN' });

    const count = await this.prisma.notification.count({
      where: {
        OR: orConditions,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(params: {
    userId?: number;
    userEmail?: string;
    role?: string;
  }) {
    const { userId, userEmail, role } = params;
    const normalizedEmail = userEmail ? userEmail.toLowerCase().trim() : undefined;
    const isSpecialAdmin = role === 'ADMIN';

    const orConditions: any[] = [{ targetRole: 'ALL' }];
    if (userId) orConditions.push({ userId });
    if (normalizedEmail) orConditions.push({ userEmail: { equals: normalizedEmail, mode: 'insensitive' } });
    if (role && role !== 'ADMIN') orConditions.push({ targetRole: role });
    if (isSpecialAdmin) orConditions.push({ targetRole: 'ADMIN' });

    return this.prisma.notification.updateMany({
      where: {
        OR: orConditions,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async broadcast(dto: BroadcastNotificationDto) {
    let targetRole = 'ALL';
    let targetEmail: string | null = null;
    let targetUserId: number | null = null;

    if (dto.specificEmail) {
      targetEmail = dto.specificEmail.toLowerCase().trim();
      const user = await this.prisma.user.findUnique({
        where: { email: targetEmail },
      });
      if (user) targetUserId = user.id;
      targetRole = null as any;
    } else if (dto.targetAudience === 'BUYERS') {
      targetRole = 'BUYER';
    } else if (dto.targetAudience === 'DONORS') {
      targetRole = 'USER';
    } else if (dto.targetAudience === 'ADMIN') {
      targetRole = 'ADMIN';
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        userEmail: targetEmail,
        targetRole,
        title: dto.title,
        message: dto.message,
        type: dto.type || 'ANNOUNCEMENT',
        link: dto.link || null,
        metadata: {
          broadcastBy: 'Admin',
          targetAudience: dto.targetAudience || 'ALL',
        },
      },
    });

    this.logger.log(`Broadcast notification sent: ${dto.title} to ${dto.specificEmail || dto.targetAudience || 'ALL'}`);
    return notification;
  }

  // =========================================================================
  // AUTOMATED EVENT TRIGGER HELPERS
  // =========================================================================

  async notifyDonationSubmitted(donation: any, causeTitle: string) {
    // 1. Notify Donor (if email provided)
    if (donation.donorEmail) {
      await this.create({
        userEmail: donation.donorEmail,
        title: 'Donation Received & Under Verification',
        message: `Your contribution of $${donation.amountUsd} USD to "${causeTitle}" has been received. Our escrow nodes are validating the proof of payment.`,
        type: 'DONATION_RECEIVED',
        link: `/donors`,
        metadata: {
          donationId: donation.id,
          causeId: donation.causeId,
          amountUsd: donation.amountUsd,
          cryptoSymbol: donation.cryptoSymbol,
          txHash: donation.txHash,
          proofUrl: donation.paymentProof,
        },
      }).catch(err => this.logger.error('Failed to create donor notification', err));
    }

    // 2. Alert Admin
    await this.create({
      targetRole: 'ADMIN',
      title: 'New Donation Proof Uploaded',
      message: `${donation.donorName} sent $${donation.amountUsd} via ${donation.cryptoSymbol} for "${causeTitle}". Verification required.`,
      type: 'DONATION_SUBMITTED',
      link: `/donors`,
      metadata: {
        donationId: donation.id,
        causeId: donation.causeId,
        proofUrl: donation.paymentProof,
        txHash: donation.txHash,
      },
    }).catch(err => this.logger.error('Failed to notify admin', err));
  }

  async notifyDonationVerified(donation: any, causeTitle: string) {
    if (donation.donorEmail) {
      await this.create({
        userEmail: donation.donorEmail,
        title: 'Donation Verified & Confirmed! 🚀',
        message: `Great news! Your donation of $${donation.amountUsd} for "${causeTitle}" has been verified on-chain and disbursed to project milestones.`,
        type: 'DONATION_VERIFIED',
        link: `/donors`,
        metadata: {
          donationId: donation.id,
          causeId: donation.causeId,
          amountUsd: donation.amountUsd,
          status: 'CONFIRMED',
        },
      }).catch(err => this.logger.error('Failed to notify donor verification', err));
    }
  }

  async notifyDonationRejected(donation: any, causeTitle: string, reason?: string) {
    if (donation.donorEmail) {
      await this.create({
        userEmail: donation.donorEmail,
        title: 'Donation Payment Verification Update',
        message: `Your payment proof for "${causeTitle}" could not be verified.${reason ? ` Reason: ${reason}` : ''} Please contact support.`,
        type: 'DONATION_REJECTED',
        link: `/donors`,
        metadata: {
          donationId: donation.id,
          causeId: donation.causeId,
          status: 'REJECTED',
          reason,
        },
      }).catch(err => this.logger.error('Failed to notify donor rejection', err));
    }
  }

  async notifyOrderPlaced(order: any) {
    // 1. Notify Buyer
    if (order.customerEmail) {
      await this.create({
        userId: order.userId || undefined,
        userEmail: order.customerEmail,
        title: `Order #${order.orderNumber} Placed`,
        message: `Thank you for shopping for charity! Your order of $${order.totalAmount.toFixed(2)} is pending payment verification. 100% of net proceeds benefit "${order.causeTitle}".`,
        type: 'ORDER_PLACED',
        link: `/account`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          proofUrl: order.paymentProof,
        },
      }).catch(err => this.logger.error('Failed to notify buyer order placed', err));
    }

    // 2. Alert Admin
    await this.create({
      targetRole: 'ADMIN',
      title: `New Store Order #${order.orderNumber}`,
      message: `${order.customerName} ordered $${order.totalAmount.toFixed(2)} via ${order.cryptoSymbol}. Payment proof attached for review.`,
      type: 'ORDER_PLACED',
      link: `/orders`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        proofUrl: order.paymentProof,
      },
    }).catch(err => this.logger.error('Failed to notify admin order placed', err));
  }

  async notifyOrderAccepted(order: any, trackingNumber: string, carrier: string) {
    if (order.customerEmail) {
      await this.create({
        userId: order.userId || undefined,
        userEmail: order.customerEmail,
        title: `Order #${order.orderNumber} Verified & In Transit 📦`,
        message: `Your payment has been verified! Package dispatched via ${carrier}. Tracking Code: ${trackingNumber}`,
        type: 'ORDER_ACCEPTED',
        link: `/track?trackingNumber=${encodeURIComponent(trackingNumber)}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingNumber,
          carrier,
          status: 'IN_TRANSIT',
        },
      }).catch(err => this.logger.error('Failed to notify buyer order accepted', err));
    }
  }
}

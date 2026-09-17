import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly activityLogs: ActivityLogsService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateOrderNumber(): string {
    return 'ADR-' + Math.floor(100000 + Math.random() * 900000);
  }

  private generateTrackingNumber(): string {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'ADR-TRK-' + code;
  }

  async createOrder(dto: CreateOrderDto, clientIp?: string, userAgent?: string) {
    const orderNumber = this.generateOrderNumber();
    const trackingNumber = this.generateTrackingNumber();
    const isExpress = dto.shippingOption === 'express';
    const carrier = isExpress ? 'DHL Priority Express' : 'Insured Global Air Express';
    const estimatedDelivery = isExpress ? '1-2 Business Days' : '3-5 Business Days';
    const txHash = dto.txHash || '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const normalizedEmail = dto.customerEmail.toLowerCase().trim();

    // Find linked user if userId not provided or check by email
    let linkedUserId = dto.userId || null;
    if (!linkedUserId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        linkedUserId = existingUser.id;
        // If user doesn't have a savedAddress, save this one
        if (!existingUser.savedAddress && dto.shippingAddress) {
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: { savedAddress: dto.shippingAddress as any },
          }).catch(() => {});
        }
      }
    }

    const paymentProof = dto.paymentProof || null;
    const initialStatus = paymentProof ? 'PENDING_VERIFICATION' : 'CONFIRMED';

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        trackingNumber,
        carrier,
        estimatedDelivery,
        customerEmail: normalizedEmail,
        customerName: dto.customerName.trim(),
        shippingAddress: dto.shippingAddress as any,
        shippingOption: dto.shippingOption || 'standard',
        totalAmount: dto.totalAmount,
        cryptoAmount: dto.cryptoAmount,
        cryptoSymbol: dto.cryptoSymbol,
        cryptoNetwork: dto.cryptoNetwork,
        txHash,
        causeId: dto.causeId,
        causeTitle: dto.causeTitle,
        items: dto.items as any,
        paymentProof,
        status: initialStatus,
        userId: linkedUserId,
      },
    });

    this.logger.log(`Order #${orderNumber} created with tracking #${trackingNumber} for ${dto.customerEmail}`);

    // Trigger in-app notifications
    this.notifications.notifyOrderPlaced(order).catch(err => {
      this.logger.error(`Failed to dispatch order placed notification: ${err.message}`);
    });

    // Log Order Placed in ActivityLog
    await this.activityLogs.log({
      type: 'ORDER_PLACED',
      actorName: order.customerName,
      actorEmail: order.customerEmail,
      userId: linkedUserId || undefined,
      ipAddress: clientIp,
      userAgent: userAgent,
      summary: `New Store Order #${order.orderNumber} ($${order.totalAmount.toFixed(2)}) by ${order.customerName} via ${order.cryptoSymbol}`,
      details: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        totalAmount: order.totalAmount,
        cryptoAmount: order.cryptoAmount,
        cryptoSymbol: order.cryptoSymbol,
        cryptoNetwork: order.cryptoNetwork,
        itemsCount: Array.isArray(dto.items) ? dto.items.length : 1,
        causeTitle: order.causeTitle,
      },
      status: 'SUCCESS',
    });

    // Process items purchased through reseller storefronts
    if (Array.isArray(dto.items)) {
      for (const item of dto.items as any[]) {
        if (item.resellerHandle || item.resellerId || item.shopId) {
          try {
            const shop = await this.prisma.resellerShop.findFirst({
              where: {
                OR: [
                  ...(item.shopId ? [{ id: item.shopId }] : []),
                  ...(item.resellerId ? [{ id: item.resellerId }] : []),
                  ...(item.resellerHandle ? [{ handle: item.resellerHandle }] : []),
                ],
              },
            });

            if (shop) {
              const qty = item.quantity || 1;
              const unitWholesale = item.wholesalePrice || (item.price / (1 + shop.maxProfitMargin / 100));
              const wholesaleCost = parseFloat((unitWholesale * qty).toFixed(2));
              const salePrice = parseFloat((item.price * qty).toFixed(2));
              const netProfit = parseFloat(Math.max(0, salePrice - wholesaleCost).toFixed(2));
              const releaseAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72h escrow

              await this.prisma.resellerOrder.create({
                data: {
                  shopId: shop.id,
                  orderNumber,
                  trackingNumber,
                  carrier,
                  buyer: dto.customerName || 'Verified Buyer',
                  buyerEmail: dto.customerEmail,
                  productId: item.id || 1,
                  productName: item.name || 'Product',
                  productImage: item.image || '/logo.png',
                  quantity: qty,
                  wholesaleCost,
                  salePrice,
                  netProfit,
                  paymentToken: dto.cryptoSymbol || 'USDC',
                  status: 'IN_TRANSIT',
                  releaseAt,
                },
              });

              await this.prisma.resellerShop.update({
                where: { id: shop.id },
                data: {
                  totalSales: { increment: qty },
                  totalRevenue: { increment: salePrice },
                  pendingEscrow: { increment: netProfit },
                },
              });
            }
          } catch (e) {
            this.logger.error(`Error linking reseller order item: ${e}`);
          }
        }
      }
    }

    // Send order confirmation & tracking email via Hostinger SMTP
    this.mailService
      .sendOrderReceiptEmail({
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress as any,
        shippingOption: order.shippingOption,
        totalAmount: order.totalAmount,
        cryptoAmount: order.cryptoAmount,
        cryptoSymbol: order.cryptoSymbol,
        cryptoNetwork: order.cryptoNetwork,
        txHash: order.txHash,
        causeId: order.causeId,
        causeTitle: order.causeTitle,
        items: order.items as any,
      })
      .then(() => {
        this.logger.log(`Order confirmation email sent to ${order.customerEmail}`);
      })
      .catch((err) => {
        this.logger.error(`Failed to send order email to ${order.customerEmail}: ${err.message}`);
      });

    return order;
  }

  async trackOrder(identifier: string) {
    const cleanId = identifier.trim();

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: cleanId, mode: 'insensitive' } },
          { trackingNumber: { equals: cleanId, mode: 'insensitive' } },
          { customerEmail: { equals: cleanId.toLowerCase(), mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      throw new NotFoundException(`No shipment found matching "${cleanId}". Please check your order or tracking number.`);
    }

    return {
      success: true,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      shippingOption: order.shippingOption,
      totalAmount: order.totalAmount,
      cryptoAmount: order.cryptoAmount,
      cryptoSymbol: order.cryptoSymbol,
      cryptoNetwork: order.cryptoNetwork,
      txHash: order.txHash,
      causeTitle: order.causeTitle,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async listOrders(query?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = query?.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 50;
    const offset = query?.offset ? Math.max(Number(query.offset), 0) : 0;

    const where: any = {};
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { trackingNumber: { contains: s, mode: 'insensitive' } },
        { customerEmail: { contains: s, mode: 'insensitive' } },
        { customerName: { contains: s, mode: 'insensitive' } },
        { causeTitle: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
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
              phone: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto, adminUser?: any) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    const dataToUpdate: any = {};
    if (dto.status) dataToUpdate.status = dto.status;
    if (dto.paymentProof !== undefined) dataToUpdate.paymentProof = dto.paymentProof;
    if (dto.trackingNumber) dataToUpdate.trackingNumber = dto.trackingNumber.trim();
    if (dto.carrier) dataToUpdate.carrier = dto.carrier.trim();
    if (dto.estimatedDelivery) dataToUpdate.estimatedDelivery = dto.estimatedDelivery.trim();

    const updated = await this.prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    // Notify buyer if order is confirmed, in transit, or received tracking code
    if (
      dto.status === 'CONFIRMED' ||
      dto.status === 'IN_TRANSIT' ||
      (dto.trackingNumber && order.status === 'PENDING_VERIFICATION')
    ) {
      this.notifications.notifyOrderAccepted(
        updated,
        updated.trackingNumber || order.trackingNumber,
        updated.carrier || order.carrier,
      ).catch(err => this.logger.error(`Failed to dispatch order accepted notification: ${err.message}`));
    }

    // Log Activity
    await this.activityLogs.log({
      type: 'ORDER_STATUS_CHANGED',
      actorName: adminUser?.name || 'Admin',
      actorEmail: adminUser?.email || 'admin@aderafoundation.com',
      userId: order.userId || undefined,
      summary: `Order #${order.orderNumber} status changed to ${dto.status} (${order.customerEmail})`,
      details: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        newStatus: dto.status,
        trackingNumber: updated.trackingNumber,
        carrier: updated.carrier,
      },
      status: 'SUCCESS',
    });

    return updated;
  }

  async resendOrderEmail(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    await this.mailService.sendOrderReceiptEmail({
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress as any,
      shippingOption: order.shippingOption,
      totalAmount: order.totalAmount,
      cryptoAmount: order.cryptoAmount,
      cryptoSymbol: order.cryptoSymbol,
      cryptoNetwork: order.cryptoNetwork,
      txHash: order.txHash,
      causeId: order.causeId,
      causeTitle: order.causeTitle,
      items: order.items as any,
    });

    return {
      success: true,
      message: `Order #${order.orderNumber} confirmation email re-dispatched to ${order.customerEmail}`,
    };
  }

  async getOrderStats() {
    const [totalOrders, confirmed, inTransit, delivered, sumResult] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.order.count({ where: { status: 'IN_TRANSIT' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      confirmedOrders: confirmed,
      inTransitOrders: inTransit,
      deliveredOrders: delivered,
      totalRevenueUsd: sumResult._sum.totalAmount || 0,
    };
  }
}

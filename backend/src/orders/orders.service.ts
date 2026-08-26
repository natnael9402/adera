import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
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

  async createOrder(dto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();
    const trackingNumber = this.generateTrackingNumber();
    const isExpress = dto.shippingOption === 'express';
    const carrier = isExpress ? 'DHL Priority Express' : 'Insured Global Air Express';
    const estimatedDelivery = isExpress ? '1-2 Business Days' : '3-5 Business Days';
    const txHash = dto.txHash || '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        trackingNumber,
        carrier,
        estimatedDelivery,
        customerEmail: dto.customerEmail.toLowerCase().trim(),
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
        status: 'CONFIRMED',
      },
    });

    this.logger.log(`Order #${orderNumber} created with tracking #${trackingNumber} for ${dto.customerEmail}`);

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

  async listOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}

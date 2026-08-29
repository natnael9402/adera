import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterResellerDto,
  LoginResellerDto,
  ImportProductDto,
  UpdateResellerProductDto,
  UpgradeTierDto,
} from './dto/reseller.dto';

export const TIER_PROFIT_LIMITS: Record<string, number> = {
  BRONZE: 20.0,
  SILVER: 25.0,
  GOLD: 30.0,
  PLATINUM: 35.0,
};

@Injectable()
export class ResellersService {
  private readonly logger = new Logger(ResellersService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private cleanHandle(handle: string): string {
    return handle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');
  }

  private generateToken(shop: { id: number; handle: string; email: string; tier: string }) {
    return this.jwt.sign(
      {
        sub: shop.id,
        shopId: shop.id,
        handle: shop.handle,
        email: shop.email,
        tier: shop.tier,
        role: 'RESELLER',
      },
      { expiresIn: '30d' },
    );
  }

  async register(dto: RegisterResellerDto) {
    const email = dto.email.toLowerCase().trim();

    const existingEmail = await this.prisma.resellerShop.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('An account with this email already exists. Please log in.');
    }

    const baseName = dto.name && dto.name.trim() ? dto.name.trim() : email.split('@')[0];
    let handle = dto.handle && dto.handle.trim() ? this.cleanHandle(dto.handle) : this.cleanHandle(email.split('@')[0]);

    if (!handle || handle.length < 2) {
      handle = `shop-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    let finalHandle = handle;
    let counter = 1;
    while (await this.prisma.resellerShop.findUnique({ where: { handle: finalHandle } })) {
      finalHandle = `${handle}-${counter++}`;
    }

    const tier = dto.tier || 'GOLD';
    const maxProfitMargin = TIER_PROFIT_LIMITS[tier] || 30.0;
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const shop = await this.prisma.resellerShop.create({
      data: {
        name: baseName,
        handle: finalHandle,
        email,
        password: hashedPassword,
        tier,
        maxProfitMargin,
        description: dto.description || `Official ${tier} verified reseller shop on Adera Store.`,
        walletAddress: dto.walletAddress || '',
        logo: dto.logo || 'preset:store_apex',
        isVerified: true,
      },
    });

    const token = this.generateToken(shop);

    return {
      message: 'Shop registered successfully!',
      token,
      shop: {
        id: shop.id,
        name: shop.name,
        handle: shop.handle,
        email: shop.email,
        tier: shop.tier,
        maxProfitMargin: shop.maxProfitMargin,
        description: shop.description,
        walletAddress: shop.walletAddress,
        logo: shop.logo,
        balance: shop.balance,
        totalSales: shop.totalSales,
      },
    };
  }

  async login(dto: LoginResellerDto) {
    const email = dto.email.toLowerCase().trim();
    const shop = await this.prisma.resellerShop.findUnique({
      where: { email },
    });

    if (!shop) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, shop.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(shop);

    return {
      token,
      shop: {
        id: shop.id,
        name: shop.name,
        handle: shop.handle,
        email: shop.email,
        tier: shop.tier,
        maxProfitMargin: shop.maxProfitMargin,
        description: shop.description,
        walletAddress: shop.walletAddress,
        balance: shop.balance,
        totalSales: shop.totalSales,
        logo: shop.logo,
        banner: shop.banner,
      },
    };
  }

  async getProfile(shopId: number) {
    const shop = await this.prisma.resellerShop.findUnique({
      where: { id: shopId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Reseller shop not found');
    }

    const { password, ...safeShop } = shop;
    return safeShop;
  }

  async updateProfile(shopId: number, data: { name?: string; handle?: string; description?: string; walletAddress?: string; logo?: string; banner?: string; tier?: string }) {
    const shop = await this.prisma.resellerShop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');

    const updateData: any = {};
    if (data.name !== undefined && data.name.trim()) {
      updateData.name = data.name.trim();
    }
    if (data.handle !== undefined && data.handle.trim()) {
      const handle = this.cleanHandle(data.handle);
      const existing = await this.prisma.resellerShop.findUnique({ where: { handle } });
      if (existing && existing.id !== shopId) {
        throw new BadRequestException(`Shop handle "@${handle}" is already taken by another store.`);
      }
      updateData.handle = handle;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.walletAddress !== undefined) updateData.walletAddress = data.walletAddress;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.banner !== undefined) updateData.banner = data.banner;
    if (data.tier !== undefined) {
      updateData.tier = data.tier;
      updateData.maxProfitMargin = TIER_PROFIT_LIMITS[data.tier] || 20.0;
    }

    const updated = await this.prisma.resellerShop.update({
      where: { id: shopId },
      data: updateData,
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async upgradeTier(shopId: number, dto: UpgradeTierDto) {
    const shop = await this.prisma.resellerShop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');

    const tier = dto.tier;
    const maxProfitMargin = TIER_PROFIT_LIMITS[tier] || 20.0;

    const updated = await this.prisma.resellerShop.update({
      where: { id: shopId },
      data: {
        tier,
        maxProfitMargin,
      },
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async getWholesaleCatalog(shopId: number) {
    const masterProducts = await this.prisma.product.findMany({
      orderBy: { id: 'desc' },
      take: 1200,
    });

    const shopListings = await this.prisma.resellerProduct.findMany({
      where: { shopId },
    });

    const listingMap = new Map<number, any>();
    for (const l of shopListings) {
      listingMap.set(l.productId, l);
    }

    return masterProducts.map((prod) => {
      const listing = listingMap.get(prod.id);
      return {
        ...prod,
        isImported: !!listing,
        importedDetails: listing || null,
      };
    });
  }

  async getInventory(shopId: number) {
    return this.prisma.resellerProduct.findMany({
      where: { shopId },
      include: {
        product: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async importProduct(shopId: number, dto: ImportProductDto) {
    const shop = await this.prisma.resellerShop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found in master catalog');

    const basePrice = product.price;
    const customPrice = parseFloat(dto.customPrice.toString());

    if (customPrice < basePrice) {
      throw new BadRequestException(`Listing price cannot be lower than the wholesale cost of $${basePrice.toFixed(2)}`);
    }

    const markupAmount = customPrice - basePrice;
    const profitMargin = (markupAmount / basePrice) * 100;

    const maxAllowed = shop.maxProfitMargin || 20.0;
    if (profitMargin > maxAllowed + 0.01) {
      throw new BadRequestException(
        `Profit margin of +${profitMargin.toFixed(1)}% exceeds your ${shop.tier} Shop maximum limit of +${maxAllowed}% (Max allowed price: $${(basePrice * (1 + maxAllowed / 100)).toFixed(2)})`,
      );
    }

    return this.prisma.resellerProduct.upsert({
      where: {
        shopId_productId: {
          shopId,
          productId: dto.productId,
        },
      },
      create: {
        shopId,
        productId: dto.productId,
        basePrice,
        customPrice,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        isActive: true,
      },
      update: {
        basePrice,
        customPrice,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        isActive: true,
      },
      include: {
        product: true,
      },
    });
  }

  async updateInventoryItem(shopId: number, id: number, dto: UpdateResellerProductDto) {
    const item = await this.prisma.resellerProduct.findFirst({
      where: { id, shopId },
      include: { product: true, shop: true },
    });

    if (!item) throw new NotFoundException('Item not found in your shop inventory');

    let customPrice = item.customPrice;
    let profitMargin = item.profitMargin;

    if (dto.customPrice !== undefined) {
      customPrice = parseFloat(dto.customPrice.toString());
      if (customPrice < item.basePrice) {
        throw new BadRequestException(`Price cannot be lower than the wholesale cost of $${item.basePrice.toFixed(2)}`);
      }
      const markupAmount = customPrice - item.basePrice;
      profitMargin = parseFloat(((markupAmount / item.basePrice) * 100).toFixed(2));

      const maxAllowed = item.shop.maxProfitMargin || 20.0;
      if (profitMargin > maxAllowed + 0.01) {
        throw new BadRequestException(
          `Profit margin of +${profitMargin.toFixed(1)}% exceeds your ${item.shop.tier} Shop limit of +${maxAllowed}%`,
        );
      }
    }

    return this.prisma.resellerProduct.update({
      where: { id },
      data: {
        customPrice,
        profitMargin,
        isActive: dto.isActive !== undefined ? dto.isActive : item.isActive,
      },
      include: {
        product: true,
      },
    });
  }

  async removeInventoryItem(shopId: number, id: number) {
    const item = await this.prisma.resellerProduct.findFirst({
      where: { id, shopId },
    });

    if (!item) throw new NotFoundException('Item not found');

    return this.prisma.resellerProduct.delete({
      where: { id },
    });
  }

  async getWallet(shopId: number) {
    const shop = await this.prisma.resellerShop.findUnique({
      where: { id: shopId },
      include: {
        withdrawals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shop) throw new NotFoundException('Shop not found');

    return {
      walletBalance: shop.walletBalance,
      pendingEscrow: shop.pendingEscrow,
      totalRevenue: shop.totalRevenue,
      totalSales: shop.totalSales,
      walletAddress: shop.walletAddress,
      withdrawals: shop.withdrawals,
    };
  }

  async requestWithdrawal(shopId: number, data: { amount: number; currency?: string; walletAddress?: string }) {
    const shop = await this.prisma.resellerShop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');

    const amount = parseFloat(data.amount.toString());
    if (amount <= 0) throw new BadRequestException('Withdrawal amount must be greater than 0');
    if (amount > shop.walletBalance) {
      throw new BadRequestException(`Insufficient wallet balance. Available: $${shop.walletBalance.toFixed(2)}`);
    }

    const walletAddress = data.walletAddress || shop.walletAddress;
    if (!walletAddress) {
      throw new BadRequestException('Please provide a payout wallet address');
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const [withdrawal, updatedShop] = await this.prisma.$transaction([
      this.prisma.resellerWithdrawal.create({
        data: {
          shopId,
          amount,
          currency: data.currency || 'USDC',
          walletAddress,
          status: 'COMPLETED',
          txHash,
        },
      }),
      this.prisma.resellerShop.update({
        where: { id: shopId },
        data: {
          walletBalance: { decrement: amount },
        },
      }),
    ]);

    return {
      message: 'Withdrawal processed successfully via Smart Contract Escrow!',
      withdrawal,
      availableBalance: updatedShop.walletBalance,
    };
  }

  async getOrders(shopId: number) {
    const shop = await this.prisma.resellerShop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');

    const orders = await this.prisma.resellerOrder.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const updatedOrders = [];

    for (const ord of orders) {
      const releaseTime = new Date(ord.releaseAt).getTime();
      const hoursRemaining = Math.max(0, Math.ceil((releaseTime - now) / (1000 * 60 * 60)));

      // Auto-release escrow if 72 hours passed
      if (hoursRemaining === 0 && ord.status === 'IN_TRANSIT') {
        await this.prisma.$transaction([
          this.prisma.resellerOrder.update({
            where: { id: ord.id },
            data: { status: 'ESCROW_RELEASED' },
          }),
          this.prisma.resellerShop.update({
            where: { id: shopId },
            data: {
              pendingEscrow: { decrement: ord.netProfit },
              walletBalance: { increment: ord.netProfit },
            },
          }),
        ]);
        ord.status = 'ESCROW_RELEASED';
      }

      updatedOrders.push({
        id: ord.orderNumber,
        buyer: ord.buyer,
        buyerEmail: ord.buyerEmail,
        productName: ord.productName,
        productImage: ord.productImage,
        quantity: ord.quantity,
        wholesaleCost: ord.wholesaleCost,
        salePrice: ord.salePrice,
        netProfit: ord.netProfit,
        paymentToken: ord.paymentToken,
        status: ord.status,
        trackingNumber: ord.trackingNumber,
        carrier: ord.carrier,
        hoursRemaining,
        createdAt: ord.createdAt.toISOString(),
      });
    }

    return updatedOrders;
  }

  async getMessages(shopId: number) {
    const shop = await this.prisma.resellerShop.findUnique({
      where: { id: shopId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shop) throw new NotFoundException('Shop not found');
    return shop.messages;
  }

  async sendMessage(data: { shopId?: number; handle?: string; sender: string; senderAvatar?: string; subject: string; content: string }) {
    let shopId = data.shopId;
    if (!shopId && data.handle) {
      const clean = this.cleanHandle(data.handle);
      const shop = await this.prisma.resellerShop.findUnique({ where: { handle: clean } });
      if (shop) shopId = shop.id;
    }

    if (!shopId) {
      throw new NotFoundException('Target reseller shop not found');
    }

    return this.prisma.resellerMessage.create({
      data: {
        shopId,
        sender: data.sender || 'Customer',
        senderAvatar: data.senderAvatar || '',
        subject: data.subject || 'Storefront Inquiry',
        content: data.content,
        isRead: false,
      },
    });
  }

  async markMessageRead(shopId: number, messageId: number) {
    return this.prisma.resellerMessage.updateMany({
      where: { id: messageId, shopId },
      data: { isRead: true },
    });
  }

  async recordShopVisit(handle: string) {
    const clean = this.cleanHandle(handle);
    return this.prisma.resellerShop.update({
      where: { handle: clean },
      data: { visits: { increment: 1 } },
    });
  }

  async getPublicShops() {
    const shops = await this.prisma.resellerShop.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        name: true,
        handle: true,
        tier: true,
        maxProfitMargin: true,
        description: true,
        logo: true,
        banner: true,
        totalSales: true,
        visits: true,
        rating: true,
        creditScore: true,
        createdAt: true,
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { totalSales: 'desc' },
    });

    return shops;
  }

  async getPublicShopByHandle(handle: string) {
    const clean = this.cleanHandle(handle);
    const shop = await this.prisma.resellerShop.findUnique({
      where: { handle: clean },
      select: {
        id: true,
        name: true,
        handle: true,
        tier: true,
        maxProfitMargin: true,
        description: true,
        logo: true,
        banner: true,
        walletAddress: true,
        totalSales: true,
        visits: true,
        rating: true,
        creditScore: true,
        createdAt: true,
        products: {
          where: { isActive: true },
          include: {
            product: true,
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException(`Shop "@${handle}" was not found.`);
    }

    // Increment visit asynchronously
    this.prisma.resellerShop.update({
      where: { id: shop.id },
      data: { visits: { increment: 1 } },
    }).catch(() => {});

    return shop;
  }
}

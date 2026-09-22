import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto, WalletDonateDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Find or automatically provision a wallet starting at strictly $0.00
  async getOrCreateWallet(userId?: number, email?: string) {
    if (userId) {
      let wallet = await this.prisma.wallet.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!wallet) {
        wallet = await this.prisma.wallet.create({
          data: {
            userId,
            userEmail: email,
            balance: 0.0,
          },
          include: {
            transactions: true,
          },
        });
      }
      return wallet;
    }

    if (email) {
      let wallet = await this.prisma.wallet.findUnique({
        where: { userEmail: email },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!wallet) {
        wallet = await this.prisma.wallet.create({
          data: {
            userEmail: email,
            balance: 0.0,
          },
          include: {
            transactions: true,
          },
        });
      }
      return wallet;
    }

    // Default guest fallback wallet with zero balance
    return {
      id: 0,
      balance: 0.0,
      transactions: [],
    };
  }

  // Record a Deposit with Proof of Payment stored in database
  async deposit(dto: DepositDto, userId?: number) {
    if (!dto.amountUsd || dto.amountUsd <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero.');
    }

    const email = dto.donorEmail?.trim().toLowerCase();
    const wallet = await this.getOrCreateWallet(userId, email);

    if (!wallet.id) {
      throw new BadRequestException('A valid user session or email is required to credit a wallet.');
    }

    const isPendingProof = Boolean(dto.paymentProof);

    // Save transaction to WalletTransaction table with proof URL
    const tx = await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount: dto.amountUsd,
        cryptoSymbol: dto.cryptoSymbol,
        cryptoAmount: dto.cryptoAmount,
        txHash: dto.txHash,
        paymentProof: dto.paymentProof || null,
        status: isPendingProof ? 'PENDING' : 'CONFIRMED',
      },
    });

    // Credit wallet balance in the Wallet table
    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: dto.amountUsd,
        },
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return {
      message: 'Deposit recorded successfully!',
      transaction: tx,
      balance: updatedWallet.balance,
      wallet: updatedWallet,
    };
  }

  // Donate directly from verified wallet balance in PostgreSQL
  async donateFromWallet(dto: WalletDonateDto, userId?: number) {
    if (!dto.amountUsd || dto.amountUsd <= 0) {
      throw new BadRequestException('Donation amount must be greater than zero.');
    }

    const email = dto.donorEmail?.trim().toLowerCase();
    const wallet = await this.getOrCreateWallet(userId, email);

    if (!wallet.id || wallet.balance < dto.amountUsd) {
      throw new BadRequestException(
        `Insufficient wallet balance ($${(wallet.balance || 0).toFixed(2)} available). Please add funds to proceed.`
      );
    }

    const post = await this.prisma.post.findUnique({
      where: { id: dto.causeId },
    });

    if (!post) {
      throw new NotFoundException('Selected cause not found.');
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Perform atomic balance deduction and cause raised increment
    const [updatedWallet, tx, updatedPost] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: dto.amountUsd,
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DONATION',
          amount: dto.amountUsd,
          cryptoSymbol: 'WALLET_USD',
          cryptoAmount: dto.amountUsd.toFixed(2),
          txHash,
          status: 'CONFIRMED',
          causeId: dto.causeId,
          causeTitle: post.title,
          donorName: dto.isAnonymous ? 'Anonymous Supporter' : dto.donorName || 'Adera Wallet Donor',
        },
      }),
      this.prisma.post.update({
        where: { id: dto.causeId },
        data: {
          raised: {
            increment: dto.amountUsd,
          },
          donationsCount: {
            increment: 1,
          },
        },
      }),
      this.prisma.directDonation.create({
        data: {
          causeId: dto.causeId,
          donorName: dto.isAnonymous ? 'Anonymous Supporter' : dto.donorName || 'Adera Wallet Donor',
          donorEmail: email,
          amountUsd: dto.amountUsd,
          cryptoAmount: dto.amountUsd.toFixed(2),
          cryptoSymbol: 'WALLET_USD',
          txHash,
          isAnonymous: dto.isAnonymous || false,
          status: 'CONFIRMED',
          paymentProof: 'WALLET_BALANCE',
        },
      }),
    ]);

    return {
      message: 'Donation completed from wallet balance!',
      txHash,
      balance: updatedWallet.balance,
      transaction: tx,
      post: updatedPost,
    };
  }

  // Admin endpoint: List all wallet transactions with proof of payment screenshots
  async getAllTransactions(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.prisma.walletTransaction.findMany({
      where,
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin endpoint: Approve a pending deposit
  async approveDeposit(transactionId: number) {
    const tx = await this.prisma.walletTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!tx || tx.type !== 'DEPOSIT') {
      throw new NotFoundException('Deposit transaction not found.');
    }
    if (tx.status === 'CONFIRMED') {
      return { message: 'Transaction already confirmed', transaction: tx };
    }

    const updated = await this.prisma.walletTransaction.update({
      where: { id: transactionId },
      data: { status: 'CONFIRMED' },
    });

    return {
      message: 'Deposit approved successfully!',
      transaction: updated,
    };
  }
}

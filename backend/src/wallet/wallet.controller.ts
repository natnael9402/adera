import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { DepositDto, WalletDonateDto } from './dto/wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private extractUserId(req: Request): number | undefined {
    const user = (req as any).user;
    return user?.id ? Number(user.id) : undefined;
  }

  @Get()
  async getWallet(@Query('email') email: string, @Req() req: Request) {
    const userId = this.extractUserId(req);
    const wallet = await this.walletService.getOrCreateWallet(userId, email?.trim().toLowerCase());
    return {
      id: wallet.id,
      balance: wallet.balance ?? 0.0,
      transactions: wallet.transactions || [],
    };
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto, @Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.walletService.deposit(dto, userId);
  }

  @Post('donate')
  async donate(@Body() dto: WalletDonateDto, @Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.walletService.donateFromWallet(dto, userId);
  }

  @Get('admin/transactions')
  async getAdminTransactions(@Query('status') status?: string) {
    return this.walletService.getAllTransactions(status);
  }

  @Post('admin/approve/:id')
  async approveDeposit(@Param('id', ParseIntPipe) id: number) {
    return this.walletService.approveDeposit(id);
  }
}

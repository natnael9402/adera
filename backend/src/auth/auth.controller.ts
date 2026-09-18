import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyCodeDto, UpdateProfileDto, QuickDonorDto } from './dto/auth.dto';
import { ResendVerificationDto } from '../mail/dto/mail.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private extractClientMeta(req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.ip || req.socket.remoteAddress || 'unknown');
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    return { ip, userAgent };
  }

  @Post('signup')
  signup(@Body() dto: SignupDto, @Req() req: Request) {
    const { ip, userAgent } = this.extractClientMeta(req);
    return this.auth.signup(dto, ip, userAgent);
  }

  @Post('quick-donor')
  quickDonor(@Body() dto: QuickDonorDto, @Req() req: Request) {
    const { ip, userAgent } = this.extractClientMeta(req);
    return this.auth.quickDonor(dto, ip, userAgent);
  }

  @Post('verify-code')
  verifyCode(@Body() dto: VerifyCodeDto, @Req() req: Request) {
    const { ip, userAgent } = this.extractClientMeta(req);
    return this.auth.verifyCode(dto, ip, userAgent);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const { ip, userAgent } = this.extractClientMeta(req);
    return this.auth.login(dto, ip, userAgent);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto, @Req() req: Request) {
    const { ip, userAgent } = this.extractClientMeta(req);
    return this.auth.resendVerification(dto.email, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return this.auth.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.auth.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto, @Req() req: Request) {
    const { ip } = this.extractClientMeta(req);
    return this.auth.updateProfile(user.id, dto, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getBuyerOrders(@CurrentUser() user: any) {
    return this.auth.getBuyerOrders(user.id);
  }
}

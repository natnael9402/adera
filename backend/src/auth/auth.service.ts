import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SignupDto, LoginDto, VerifyCodeDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  private generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(dto: SignupDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      if (!existing.verified) {
        // User created earlier but not verified, generate fresh code and resend
        return this.resendVerification(normalizedEmail);
      }
      throw new BadRequestException('An account with this email already exists. Please log in.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: normalizedEmail, name: dto.name.trim(), password: hashed },
    });

    const code = this.generate6DigitCode();
    await this.prisma.verificationToken.create({
      data: {
        token: code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.mail
      .sendVerificationEmail(user.email, user.name, code)
      .then(() => this.logger.log(`Verification code ${code} sent to ${user.email}`))
      .catch((err) => this.logger.error(`Failed to send verification email to ${user.email}: ${err.message}`));

    return {
      message: 'Account created. Please enter the 6-digit verification code sent to your email.',
      email: user.email,
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedCode = dto.code.trim();

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    if (user.verified) {
      const token = this.jwt.sign({ sub: user.id, role: user.role });
      return {
        message: 'Account already verified.',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    }

    const record = await this.prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        token: normalizedCode,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired 6-digit verification code. Please request a new code.');
    }

    // Mark user verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    // Delete token
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      message: 'Email verified successfully! Welcome to Adera Foundation.',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async resendVerification(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    if (user.verified) {
      return { message: 'Your account is already verified. You can log in.' };
    }

    // Delete any old tokens
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Create fresh 6-digit code
    const code = this.generate6DigitCode();
    await this.prisma.verificationToken.create({
      data: {
        token: code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.mail
      .sendVerificationEmail(user.email, user.name, code)
      .then(() => this.logger.log(`Resent verification code ${code} to ${user.email}`))
      .catch((err) => this.logger.error(`Failed to resend verification email: ${err.message}`));

    return { message: 'A new 6-digit verification code has been sent to your email.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findFirst({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      // Check if user is already verified
      throw new BadRequestException('Invalid or expired verification link.');
    }

    await this.prisma.user.update({ where: { id: record.userId }, data: { verified: true } });
    await this.prisma.verificationToken.deleteMany({ where: { userId: record.userId } });
    return { message: 'Email verified successfully! You can now sign in.' };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.verified) {
      // Automatically send a fresh code if they try to log in before verifying
      await this.resendVerification(normalizedEmail);
      throw new UnauthorizedException('Please verify your email address. We have sent a fresh 6-digit code to your inbox.');
    }

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  getProfile(user: any) {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}

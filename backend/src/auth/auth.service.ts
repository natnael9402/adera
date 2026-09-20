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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { SignupDto, LoginDto, VerifyCodeDto, UpdateProfileDto, QuickDonorDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private activityLogs: ActivityLogsService,
  ) {}

  private generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(dto: SignupDto, clientIp?: string, userAgent?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new BadRequestException('An account with this email already exists. Please sign in with your password.');
    }

    const role = dto.role === 'BUYER' ? 'BUYER' : 'USER';
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: dto.name.trim(),
        password: hashed,
        phone: dto.phone ? dto.phone.trim() : null,
        role: role as any,
        verified: true,
      },
    });

    const code = this.generate6DigitCode();
    await this.prisma.verificationToken.create({
      data: {
        token: code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});

    // Log Activity
    await this.activityLogs.log({
      type: role === 'BUYER' ? 'BUYER_SIGNUP' : 'USER_SIGNUP',
      actorName: user.name,
      actorEmail: user.email,
      userId: user.id,
      ipAddress: clientIp,
      userAgent: userAgent,
      summary: `${role === 'BUYER' ? 'Buyer' : 'User'} signed up: ${user.name} (${user.email})`,
      details: { role, phone: dto.phone },
      status: 'SUCCESS',
    });

    this.mail
      .sendVerificationEmail(user.email, user.name, code)
      .then(() => this.logger.log(`Verification code ${code} sent to ${user.email}`))
      .catch((err) => this.logger.warn(`Failed to send verification email to ${user.email}: ${err.message}`));

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      message: 'Account created successfully. Welcome to Adera!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedAddress: user.savedAddress,
      },
    };
  }

  async quickDonor(dto: QuickDonorDto, clientIp?: string, userAgent?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user) {
      if (dto.password) {
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
          throw new BadRequestException('An account with this email already exists. Please enter the correct password to sign in.');
        }
      } else {
        throw new BadRequestException('An account with this email already exists. Please enter your password to sign in.');
      }

      if (!user.verified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { verified: true, lastLoginAt: new Date() },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }

      await this.activityLogs.log({
        type: 'DONOR_LOGIN',
        actorName: user.name,
        actorEmail: user.email,
        userId: user.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        summary: `Donor signed in via quick donor auth: ${user.name} (${user.email})`,
        status: 'SUCCESS',
      });
    } else {
      const rawPassword = dto.password && dto.password.length >= 6
        ? dto.password
        : Math.random().toString(36).slice(-8) + 'Aa1!';
      const hashed = await bcrypt.hash(rawPassword, 10);
      const displayName = (dto.name && dto.name.trim()) ? dto.name.trim() : normalizedEmail.split('@')[0];

      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: displayName,
          password: hashed,
          role: 'USER',
          verified: true,
          lastLoginAt: new Date(),
        },
      });

      await this.activityLogs.log({
        type: 'DONOR_SIGNUP',
        actorName: user.name,
        actorEmail: user.email,
        userId: user.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        summary: `New donor registered via quick donor auth: ${user.name} (${user.email})`,
        status: 'SUCCESS',
      });
    }

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedAddress: user.savedAddress,
      },
    };
  }

  async verifyCode(dto: VerifyCodeDto, clientIp?: string, userAgent?: string) {
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
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, savedAddress: user.savedAddress },
      };
    }

    const record = await this.prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        token: normalizedCode,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      await this.activityLogs.log({
        type: 'VERIFICATION_FAILED',
        actorName: user.name,
        actorEmail: user.email,
        userId: user.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        summary: `Verification code failed for ${user.email}`,
        status: 'FAILED',
      });
      throw new BadRequestException('Invalid or expired 6-digit verification code. Please request a new code.');
    }

    // Mark user verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verified: true, lastLoginAt: new Date() },
    });

    // Delete token
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Log Activity
    await this.activityLogs.log({
      type: 'USER_VERIFIED',
      actorName: user.name,
      actorEmail: user.email,
      userId: user.id,
      ipAddress: clientIp,
      userAgent: userAgent,
      summary: `Email verified successfully for ${user.name} (${user.email})`,
      status: 'SUCCESS',
    });

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      message: 'Email verified successfully! Welcome to Adera.',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, savedAddress: user.savedAddress },
    };
  }

  async resendVerification(email: string, clientIp?: string, userAgent?: string) {
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

  async login(dto: LoginDto, clientIp?: string, userAgent?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      await this.activityLogs.log({
        type: 'LOGIN_FAILED',
        actorName: 'Guest',
        actorEmail: normalizedEmail,
        ipAddress: clientIp,
        userAgent: userAgent,
        summary: `Failed login attempt (wrong email): ${normalizedEmail}`,
        status: 'FAILED',
      });
      throw new UnauthorizedException('Wrong email. No account found with this email address.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      await this.activityLogs.log({
        type: 'LOGIN_FAILED',
        actorName: user.name,
        actorEmail: user.email,
        userId: user.id,
        ipAddress: clientIp,
        userAgent: userAgent,
        summary: `Failed login attempt (wrong password) for ${user.email}`,
        status: 'FAILED',
      });
      throw new UnauthorizedException('Wrong password. Please check your password and try again.');
    }

    // Auto-verify if user enters correct password so quick sign-in works 100%
    if (!user.verified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { verified: true, lastLoginAt: new Date() },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Log Activity
    const isBuyer = user.role === 'BUYER';
    const isAdmin = user.role === 'ADMIN';
    await this.activityLogs.log({
      type: isAdmin ? 'ADMIN_LOGIN' : isBuyer ? 'BUYER_LOGIN' : 'USER_LOGIN',
      actorName: user.name,
      actorEmail: user.email,
      userId: user.id,
      ipAddress: clientIp,
      userAgent: userAgent,
      summary: `${isAdmin ? 'Admin' : isBuyer ? 'Buyer' : 'User'} logged in: ${user.name} (${user.email})`,
      details: { role: user.role },
      status: 'SUCCESS',
    });

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedAddress: user.savedAddress,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        savedAddress: true,
        verified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto, clientIp?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const dataToUpdate: any = {};
    if (dto.name) dataToUpdate.name = dto.name.trim();
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.avatar !== undefined) dataToUpdate.avatar = dto.avatar;
    if (dto.savedAddress !== undefined) dataToUpdate.savedAddress = dto.savedAddress;

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to change password.');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!valid) {
        throw new BadRequestException('Current password is incorrect.');
      }
      dataToUpdate.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        savedAddress: true,
        verified: true,
        updatedAt: true,
      },
    });

    await this.activityLogs.log({
      type: 'PROFILE_UPDATED',
      actorName: updated.name,
      actorEmail: updated.email,
      userId: updated.id,
      ipAddress: clientIp,
      summary: `Profile updated for ${updated.name} (${updated.email})`,
      status: 'SUCCESS',
    });

    return updated;
  }

  async getBuyerOrders(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.order.findMany({
      where: {
        OR: [
          { userId },
          { customerEmail: { equals: user.email, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SubscribeNewsletterDto, ContactMessageDto } from './dto/mail.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('smtp-status')
  async checkSmtpStatus() {
    return this.mailService.testSmtpConnection();
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if email already registered
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        await this.prisma.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: { isActive: true },
        });
      }
      return {
        success: true,
        message: 'You are already subscribed to Adera Foundation updates!',
        alreadySubscribed: true,
      };
    }

    // Save new subscriber
    await this.prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        isActive: true,
      },
    });

    // Send Welcome Email in background
    this.mailService
      .sendNewsletterWelcomeEmail(normalizedEmail)
      .then(() => {
        this.logger.log(`Newsletter welcome email sent to ${normalizedEmail}`);
      })
      .catch((err) => {
        this.logger.error(`Failed to send newsletter welcome email to ${normalizedEmail}: ${err.message}`);
      });

    return {
      success: true,
      message: 'Successfully subscribed! Check your inbox for our welcome impact overview.',
    };
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() dto: ContactMessageDto) {
    // Record inquiry in Database
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        topic: dto.topic.trim(),
        message: dto.message.trim(),
        status: 'UNREAD',
      },
    });

    // Send Admin Notification email
    this.mailService
      .sendContactInquiryNotification({
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        topic: dto.topic.trim(),
        message: dto.message.trim(),
      })
      .then(() => {
        this.logger.log(`Contact inquiry email dispatched to admin for inquiry #${inquiry.id}`);
      })
      .catch((err) => {
        this.logger.error(`Failed to send contact inquiry notification to admin: ${err.message}`);
      });

    // Send Auto-reply to User
    this.mailService
      .sendContactAutoReply(
        dto.email.trim().toLowerCase(),
        dto.name.trim(),
        dto.topic.trim(),
      )
      .then(() => {
        this.logger.log(`Contact auto-reply sent to ${dto.email}`);
      })
      .catch((err) => {
        this.logger.error(`Failed to send contact auto-reply to ${dto.email}: ${err.message}`);
      });

    return {
      success: true,
      message: 'Thank you! Your message has been received and our team will get back to you promptly.',
    };
  }
}

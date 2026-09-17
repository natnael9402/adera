import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // List notifications for current user (or guest by email in query)
  @Get()
  async getNotifications(
    @Query('unreadOnly') unreadOnly?: string,
    @Query('email') guestEmail?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?: any
  ) {
    // Try to extract user from authorization header if available
    let userId: number | undefined;
    let userEmail: string | undefined = guestEmail;
    let role: string | undefined;

    if (req?.user) {
      userId = req.user.id;
      userEmail = req.user.email || userEmail;
      role = req.user.role;
    }

    return this.notifications.getNotifications({
      userId,
      userEmail,
      role,
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit, 10) : 40,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  // Lightweight unread counter for notification bell badge
  @Get('unread-count')
  async getUnreadCount(
    @Query('email') guestEmail?: string,
    @Req() req?: any
  ) {
    let userId: number | undefined;
    let userEmail: string | undefined = guestEmail;
    let role: string | undefined;

    if (req?.user) {
      userId = req.user.id;
      userEmail = req.user.email || userEmail;
      role = req.user.role;
    }

    return this.notifications.getUnreadCount({
      userId,
      userEmail,
      role,
    });
  }

  // Mark single notification as read
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notifications.markAsRead(id);
  }

  // Mark all notifications as read
  @Post('mark-all-read')
  async markAllAsRead(
    @Query('email') guestEmail?: string,
    @Req() req?: any
  ) {
    let userId: number | undefined;
    let userEmail: string | undefined = guestEmail;
    let role: string | undefined;

    if (req?.user) {
      userId = req.user.id;
      userEmail = req.user.email || userEmail;
      role = req.user.role;
    }

    return this.notifications.markAllAsRead({
      userId,
      userEmail,
      role,
    });
  }

  // Admin Broadcast / Custom Notification Sender
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/broadcast')
  async broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notifications.broadcast(dto);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { MailService } from '../mail/mail.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AdminService } from './admin.service';
import { CreatePostDto, UpdatePostStatusDto } from '../posts/dto/post.dto';
import { UpdateOrderStatusDto } from '../orders/dto/create-order.dto';
import { QueryActivityLogDto } from '../activity-logs/dto/query-activity-log.dto';
import { SendDirectEmailDto } from '../mail/dto/mail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly posts: PostsService,
    private readonly users: UsersService,
    private readonly orders: OrdersService,
    private readonly mail: MailService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  // --- Posts & Causes ---
  @Get('posts')
  getAllPosts() {
    return this.posts.findAll();
  }

  @Post('posts')
  createPost(@Body() dto: CreatePostDto, @CurrentUser() user: any) {
    return this.posts.create(dto, user.id, 'APPROVED');
  }

  @Post('posts/:id/status')
  updatePostStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostStatusDto) {
    return this.posts.updateStatus(id, dto);
  }

  // --- Users & Customers ---
  @Get('users')
  getUsers(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllPlatformUsers({ type, search, limit });
  }

  @Get('customers')
  getCustomers(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getCustomers({ search, limit, offset });
  }

  @Get('customers/:id')
  getCustomerDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCustomerDetails(id);
  }

  // --- Store Orders ---
  @Get('orders')
  getOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.orders.listOrders({ status, search, limit, offset });
  }

  @Get('orders/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orders.getOrderById(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.orders.updateOrderStatus(id, dto, user);
  }

  @Post('orders/:id/resend-email')
  resendOrderEmail(@Param('id', ParseIntPipe) id: number) {
    return this.orders.resendOrderEmail(id);
  }

  // --- Activity & Audit Logs ---
  @Get('activities')
  getActivities(@Query() query: QueryActivityLogDto) {
    return this.activityLogs.findAll(query);
  }

  @Get('activities/recent')
  getRecentActivities(@Query('limit') limit?: number) {
    return this.activityLogs.getRecent(limit ? Number(limit) : 10);
  }

  // --- Email Logs & Communications ---
  @Get('emails')
  getEmailLogs(
    @Query('template') template?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.mail.findAllEmailLogs({ template, status, search, limit, offset });
  }

  @Get('emails/:id')
  getEmailLogById(@Param('id', ParseIntPipe) id: number) {
    return this.mail.getEmailLogById(id);
  }

  @Post('emails/:id/resend')
  resendEmail(@Param('id', ParseIntPipe) id: number) {
    return this.mail.resendEmail(id);
  }

  @Post('emails/send')
  sendDirectEmail(@Body() dto: SendDirectEmailDto, @CurrentUser() adminUser: any) {
    return this.mail.sendDirectEmail({
      ...dto,
      adminEmail: adminUser?.email,
      adminId: adminUser?.id,
    });
  }
}


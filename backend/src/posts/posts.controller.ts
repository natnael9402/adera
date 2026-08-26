import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { 
  CreatePostDto, 
  UpdatePostStatusDto, 
  ActivatePostDto, 
  DonateToPostDto, 
  AddPostUpdateDto 
} from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Get()
  findAllApproved() {
    return this.posts.findAllApproved();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('status') status?: string) {
    return this.posts.findAll(status);
  }

  @Get('my/campaigns')
  @UseGuards(JwtAuthGuard)
  findMyCampaigns(@CurrentUser() user: any) {
    return this.posts.findByAuthor(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posts.findById(id);
  }

  @Get(':id/donations')
  findDonations(@Param('id', ParseIntPipe) id: number) {
    return this.posts.getDonations(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: any) {
    return this.posts.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/activate')
  activate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActivatePostDto,
    @CurrentUser() user: any
  ) {
    return this.posts.activate(id, user.id, dto);
  }

  // Frictionless Public Guest Donation (No auth required)
  @Post(':id/donate')
  donate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DonateToPostDto
  ) {
    return this.posts.donate(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/updates')
  addUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPostUpdateDto,
    @CurrentUser() user: any
  ) {
    return this.posts.addUpdate(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostStatusDto) {
    return this.posts.updateStatus(id, dto);
  }

  // Admin-only Cause Description Draft Assistant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('generate-description')
  generateDescription(@Body() dto: any) {
    return this.posts.generateCauseDescription(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  adminUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.posts.adminUpdate(id, dto);
  }
}

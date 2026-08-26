import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto, UpdatePostStatusDto } from '../posts/dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private posts: PostsService,
    private users: UsersService,
  ) {}

  @Get('stats')
  getStats() {
    return this.posts.getStats();
  }

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

  @Get('users')
  getUsers() {
    return this.users.findAll();
  }
}

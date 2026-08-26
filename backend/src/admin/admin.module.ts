import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PostsModule, UsersModule],
  controllers: [AdminController],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { ProductsModule } from './products/products.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { CryptoModule } from './crypto/crypto.module';
import { DonorsModule } from './donors/donors.module';
import { OrdersModule } from './orders/orders.module';
import { ResellersModule } from './resellers/resellers.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    AdminModule,
    MailModule,
    ProductsModule,
    PaymentMethodsModule,
    CryptoModule,
    DonorsModule,
    OrdersModule,
    ResellersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

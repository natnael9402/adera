import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        console.log('Database connected successfully');
        break;
      } catch (err: any) {
        retries--;
        console.error(`Database connection failed (${retries} retries left):`, err.message);
        if (retries === 0) {
          console.error('Proceeding without crashing so HTTP server stays up.');
        } else {
          await new Promise((res) => setTimeout(res, 3000));
        }
      }
    }
  }
}

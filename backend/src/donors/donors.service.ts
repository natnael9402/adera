import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateDonorInput {
  name: string;
  amount: number;
  date: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

export interface UpdateDonorInput {
  name?: string;
  amount?: number;
  date?: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

@Injectable()
export class DonorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.donor.findMany({
      orderBy: { amount: 'desc' },
    });
  }

  async create(data: CreateDonorInput) {
    return this.prisma.donor.create({
      data: {
        name: data.name,
        amount: data.amount,
        date: data.date,
        avatar: data.avatar || '',
        title: data.title || '',
        badge: data.badge || '',
      },
    });
  }

  async update(id: number, data: UpdateDonorInput) {
    const donor = await this.prisma.donor.findUnique({ where: { id } });
    if (!donor) throw new NotFoundException('Donor not found');
    return this.prisma.donor.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const donor = await this.prisma.donor.findUnique({ where: { id } });
    if (!donor) throw new NotFoundException('Donor not found');
    return this.prisma.donor.delete({
      where: { id },
    });
  }
}

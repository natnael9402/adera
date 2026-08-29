import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, Prisma } from '@prisma/client';
import { runProductMigration } from '../../scripts/seed-1000-products';

export interface ProductFilterQuery {
  search?: string;
  category?: string;
  source?: string;
  brand?: string;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'popular' | 'newest';
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(query?: ProductFilterQuery): Promise<Product[] | { items: Product[]; total: number; page: number; totalPages: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (query?.category && query.category !== 'All') {
      where.category = query.category;
    }

    if (query?.source && query.source !== 'All') {
      where.source = query.source;
    }

    if (query?.brand && query.brand !== 'All') {
      where.brand = { contains: query.brand, mode: 'insensitive' };
    }

    if (query?.search && query.search.trim() !== '') {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { brand: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
        { sku: { contains: s, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query?.sortBy === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (query?.sortBy === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (query?.sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (query?.sortBy === 'popular') {
      orderBy = { sold: 'desc' };
    } else if (query?.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    // If explicit pagination is requested:
    if (query?.page && query?.limit) {
      const page = Math.max(1, Number(query.page));
      const limit = Math.min(100, Math.max(1, Number(query.limit)));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Default full listing (e.g. for client-side instant caching & search):
    return this.prisma.product.findMany({
      where,
      orderBy,
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, data: Partial<CreateProductDto>): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async seed1000Catalog(): Promise<any> {
    return runProductMigration();
  }
}

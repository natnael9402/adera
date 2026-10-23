import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, static as expressStatic } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload limit to 10MB across all endpoints
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Ensure public uploads directory exists and is statically served
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressStatic(uploadsDir));

  // Explicitly hardcoded allowed Adera domains & dev environments
  const ADERA_DOMAINS = [
    'https://shop.aderafoundation.com',
    'https://aderafoundation.com',
    'https://www.aderafoundation.com',
    'https://admin.aderafoundation.com',
    'https://api.aderafoundation.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5001',
    'http://187.127.92.55:12000',
    'http://187.127.92.55:12001',
    'http://187.127.92.55:12002',
    'http://187.127.92.55:12003',
  ];

  const isAderaOrAllowedOrigin = (origin?: string): boolean => {
    if (!origin) return true;
    if (ADERA_DOMAINS.includes(origin)) return true;
    try {
      const hostname = new URL(origin).hostname;
      if (hostname === 'aderafoundation.com' || hostname.endsWith('.aderafoundation.com')) {
        return true;
      }
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      // fallback
    }
    return true; // allow all
  };

  // Comprehensive CORS handler for all environments & subdomains
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const allowedOrigin = origin || '*';

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    if (origin) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    
    const reqHeaders = req.headers['access-control-request-headers'];
    if (reqHeaders) {
      res.setHeader('Access-Control-Allow-Headers', reqHeaders);
    } else {
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin, *');
    }
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin', '*'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 5001;
  await app.listen(port, '0.0.0.0');
  console.log('Backend running on http://0.0.0.0:' + port);
}
bootstrap();

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const uploadsDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided or file type rejected');
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files (JPG, PNG, GIF, WEBP, SVG) are allowed');
    }

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = extname(file.originalname || '') || (file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : '.jpg');
    const sanitizedFileName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = join(uploadsDir, sanitizedFileName);

    writeFileSync(filePath, file.buffer);

    const publicUrl = `/uploads/${sanitizedFileName}`;
    return {
      url: publicUrl,
      fileName: sanitizedFileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

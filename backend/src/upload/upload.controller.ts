import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const uploadsDir = join(process.cwd(), 'public', 'uploads');
const proofsDir = join(uploadsDir, 'proofs');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
if (!existsSync(proofsDir)) {
  mkdirSync(proofsDir, { recursive: true });
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

  // Dedicated Payment Proof Upload Endpoint (Multipart)
  @Post('proof')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 8 * 1024 * 1024, // 8MB limit (though client-shrunk files are ~200KB)
      },
    })
  )
  uploadPaymentProof(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No payment proof file provided');
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files (JPG, PNG, WEBP) are accepted as payment proof');
    }

    if (!existsSync(proofsDir)) {
      mkdirSync(proofsDir, { recursive: true });
    }

    const ext = extname(file.originalname || '') || (file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : '.jpg');
    const sanitizedFileName = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = join(proofsDir, sanitizedFileName);

    writeFileSync(filePath, file.buffer);

    const publicUrl = `/uploads/proofs/${sanitizedFileName}`;
    return {
      url: publicUrl,
      fileName: sanitizedFileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
    };
  }

  // Base64 Proof Upload Endpoint (Fallback for Canvas toDataURL)
  @Post('proof-base64')
  uploadPaymentProofBase64(@Body() body: { imageBase64: string; fileName?: string }) {
    if (!body || !body.imageBase64) {
      throw new BadRequestException('Missing imageBase64 data');
    }

    if (!existsSync(proofsDir)) {
      mkdirSync(proofsDir, { recursive: true });
    }

    const matches = body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException('Invalid base64 image data URI format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
    const sanitizedFileName = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = join(proofsDir, sanitizedFileName);

    writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/proofs/${sanitizedFileName}`;
    return {
      url: publicUrl,
      fileName: sanitizedFileName,
      size: buffer.length,
      mimetype: mimeType,
      uploadedAt: new Date().toISOString(),
    };
  }
}

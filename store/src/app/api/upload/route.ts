import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files (JPG, PNG, WEBP, SVG, GIF) are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 10MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
    const sanitizedFileName = `store_upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. Save locally to store/public/uploads
    const storeUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(storeUploadsDir)) {
      fs.mkdirSync(storeUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(storeUploadsDir, sanitizedFileName);
    fs.writeFileSync(localFilePath, buffer);

    // Also sync to frontend & admin public/uploads if they exist locally
    try {
      const frontendUploadsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads');
      if (fs.existsSync(path.dirname(frontendUploadsDir))) {
        if (!fs.existsSync(frontendUploadsDir)) fs.mkdirSync(frontendUploadsDir, { recursive: true });
        fs.writeFileSync(path.join(frontendUploadsDir, sanitizedFileName), buffer);
      }

      const adminUploadsDir = path.join(process.cwd(), '..', 'admin', 'public', 'uploads');
      if (fs.existsSync(path.dirname(adminUploadsDir))) {
        if (!fs.existsSync(adminUploadsDir)) fs.mkdirSync(adminUploadsDir, { recursive: true });
        fs.writeFileSync(path.join(adminUploadsDir, sanitizedFileName), buffer);
      }
    } catch (e) {
      // non-blocking local sync
    }

    const localUrl = `/uploads/${sanitizedFileName}`;

    return NextResponse.json({
      url: localUrl,
      fileName: sanitizedFileName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Store upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image upload' },
      { status: 500 }
    );
  }
}

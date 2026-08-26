import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files (PNG, JPG, WEBP, SVG) are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
    const sanitizedFileName = `cause_upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 1. Save locally to admin/public/uploads
    const adminUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(adminUploadsDir)) {
      fs.mkdirSync(adminUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(adminUploadsDir, sanitizedFileName);
    fs.writeFileSync(localFilePath, buffer);

    // Also sync to frontend/public/uploads
    try {
      const frontendUploadsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads');
      if (fs.existsSync(path.dirname(frontendUploadsDir))) {
        if (!fs.existsSync(frontendUploadsDir)) fs.mkdirSync(frontendUploadsDir, { recursive: true });
        fs.writeFileSync(path.join(frontendUploadsDir, sanitizedFileName), buffer);
      }
    } catch (e) {
      // non-blocking sync
    }

    const localUrl = `/uploads/${sanitizedFileName}`;

    return NextResponse.json({
      url: localUrl,
      fileName: sanitizedFileName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

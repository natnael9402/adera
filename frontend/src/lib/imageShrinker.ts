/**
 * Client-Side Image Shrinker & Compressor
 * Uses HTML5 Canvas to resize high-resolution camera/phone screenshots
 * down to max dimension (default 1280px) and converts to WebP/JPEG.
 * Typically cuts 5MB-10MB mobile screenshots down to ~150KB-250KB (95%+ savings).
 */

export interface ShrinkResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  shrunkSize: number;
  width: number;
  height: number;
  compressionRatio: number; // percentage saved, e.g. 94.5
  savedBytes: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function shrinkImage(
  inputFile: File,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<ShrinkResult> {
  if (!inputFile.type.startsWith('image/')) {
    throw new Error('Provided file is not an image');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate scaled dimensions keeping aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        // Fill background white in case of transparent PNG screenshots
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        const outputMime = 'image/webp';
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL(outputMime, quality);
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }

            const cleanBaseName = inputFile.name.replace(/\.[^/.]+$/, '');
            const ext = blob.type === 'image/webp' ? '.webp' : '.jpg';
            const shrunkFile = new File([blob], `${cleanBaseName}${ext}`, {
              type: blob.type,
              lastModified: Date.now(),
            });

            const originalSize = inputFile.size;
            const shrunkSize = blob.size;
            const savedBytes = Math.max(0, originalSize - shrunkSize);
            const compressionRatio = originalSize > 0
              ? Math.max(0, Math.round(((originalSize - shrunkSize) / originalSize) * 100))
              : 0;

            resolve({
              file: shrunkFile,
              blob,
              dataUrl,
              originalSize,
              shrunkSize,
              width,
              height,
              compressionRatio,
              savedBytes,
            });
          },
          outputMime,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(inputFile);
  });
}

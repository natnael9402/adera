import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();
const LIMIT = 50;

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('Reading products.json...');
  const dataPath = path.join(__dirname, '..', 'products.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('products.json not found in root directory.');
    process.exit(1);
  }

  let fileData = fs.readFileSync(dataPath, 'utf8');
  if (fileData.charCodeAt(0) === 0xFEFF) {
    fileData = fileData.slice(1);
  }
  const parsed = JSON.parse(fileData);
  const products = parsed.products || [];

  console.log(`Found ${products.length} products. Processing the first ${LIMIT}...`);

  const publicDir = path.join(__dirname, '..', 'store', 'public', 'products');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Also mirror images to frontend if it has a shop display, though 'store' is the main app for it.
  const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public', 'products');
  if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
  }

  for (let i = 0; i < Math.min(LIMIT, products.length); i++) {
    const p = products[i];
    
    // Create a safe image filename
    const ext = path.extname(p.image) || '.jpg';
    const imgFilename = `${p._id}${ext}`;
    const imgDestStore = path.join(publicDir, imgFilename);
    const imgDestFrontend = path.join(frontendPublicDir, imgFilename);

    console.log(`[${i+1}/${LIMIT}] Downloading image for: ${p.name.substring(0, 30)}...`);
    try {
      await downloadImage(p.image, imgDestStore);
      // Copy to frontend public dir just in case
      fs.copyFileSync(imgDestStore, imgDestFrontend);
    } catch (err) {
      console.error(`Failed to download image ${p.image}:`, err);
    }

    // Insert into DB
    const imagePath = `/products/${imgFilename}`;
    const categoryName = p.category?.name || 'General';
    
    await prisma.product.create({
      data: {
        name: p.name,
        description: `Imported product from Banggoods: ${p.name}`,
        price: p.price,
        originalPrice: p.originalPrice,
        image: imagePath,
        category: categoryName,
        rating: p.rating || 0,
        sold: p.sold || 0,
      }
    });

    console.log(`--> Inserted ${p.name.substring(0, 30)} into DB.`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

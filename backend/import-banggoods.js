const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rawData = JSON.parse(
    fs.readFileSync(
      'C:/Users/natna/.gemini/antigravity/brain/ed729b18-2cb7-471c-bfa0-9ae4522b1f87/scratch/all_banggoods_products.json',
      'utf8'
    )
  );

  console.log(`Starting import of ${rawData.length} products from Banggoods...`);

  // Clear existing product table or upsert
  await prisma.resellerProduct.deleteMany({});
  await prisma.product.deleteMany({});

  const formattedProducts = rawData.map((p, index) => {
    const categoryName = p.category?.name || 'Computers & Accessories';
    const price = parseFloat((p.wholesalePrice || p.price || 19.99).toFixed(2));
    const originalPrice = p.originalPrice ? parseFloat(p.originalPrice.toFixed(2)) : parseFloat((price * 1.35).toFixed(2));
    const rating = p.rating && p.rating > 0 ? parseFloat(p.rating.toFixed(1)) : parseFloat((4.5 + (index % 5) * 0.1).toFixed(1));
    const sold = p.sold && p.sold > 0 ? p.sold : 25 + (index * 7) % 450;
    const description = p.description || `${p.name} - High quality wholesale grade product from verified manufacturer with global insured air express delivery.`;

    return {
      name: p.name || `Product ${index + 1}`,
      description,
      price: price > 0 ? price : 9.99,
      originalPrice: originalPrice > price ? originalPrice : parseFloat((price * 1.25).toFixed(2)),
      image: p.image || '/logo.png',
      category: categoryName,
      rating,
      sold,
    };
  });

  // Batch insert in chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < formattedProducts.length; i += chunkSize) {
    const chunk = formattedProducts.slice(i, i + chunkSize);
    await prisma.product.createMany({
      data: chunk,
    });
    console.log(`Inserted chunk ${i + 1} to ${Math.min(i + chunkSize, formattedProducts.length)} / ${formattedProducts.length}`);
  }

  const totalInDb = await prisma.product.count();
  console.log(`Successfully imported all ${totalInDb} products from Banggoods into database!`);

  // Re-seed some curated reseller items for the 3 demo shops
  const allDbProducts = await prisma.product.findMany({ take: 20 });
  const shops = await prisma.resellerShop.findMany();

  if (shops.length > 0 && allDbProducts.length > 0) {
    for (const shop of shops) {
      const margin = shop.maxProfitMargin || 20;
      const productsForShop = allDbProducts.slice(0, 6);
      for (const p of productsForShop) {
        await prisma.resellerProduct.upsert({
          where: { shopId_productId: { shopId: shop.id, productId: p.id } },
          create: {
            shopId: shop.id,
            productId: p.id,
            basePrice: p.price,
            customPrice: parseFloat((p.price * (1 + margin * 0.9 / 100)).toFixed(2)),
            profitMargin: parseFloat((margin * 0.9).toFixed(1)),
            isActive: true,
          },
          update: {},
        });
      }
    }
    console.log('Re-linked sample reseller inventory with new Banggoods products!');
  }
}

main()
  .catch((e) => console.error('Error importing:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });

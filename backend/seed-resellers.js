const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Panda232323@', 10);

  // 1. Apex Tech (Platinum 35%)
  const shop1 = await prisma.resellerShop.upsert({
    where: { handle: 'apex-tech' },
    create: {
      name: 'Apex Digital & Compute Hub',
      handle: 'apex-tech',
      email: 'reseller.apex@adera.io',
      password: hashedPassword,
      tier: 'PLATINUM',
      maxProfitMargin: 35.0,
      description: 'Official Platinum Partner delivering enterprise workstations, OLED displays, and mechanical peripherals with crypto escrow.',
      walletAddress: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
      balance: 1420.50,
      totalSales: 48,
      isVerified: true
    },
    update: {}
  });

  // 2. Horizon Gear (Gold 30%)
  const shop2 = await prisma.resellerShop.upsert({
    where: { handle: 'horizon-gear' },
    create: {
      name: 'Horizon Athletics & Field Gear',
      handle: 'horizon-gear',
      email: 'reseller.horizon@adera.io',
      password: hashedPassword,
      tier: 'GOLD',
      maxProfitMargin: 30.0,
      description: 'Curated performance athletic footwear, therapeutic recovery tools, and deep-sea angling gear.',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      balance: 890.00,
      totalSales: 32,
      isVerified: true
    },
    update: {}
  });

  // 3. Nordic Home (Silver 25%)
  const shop3 = await prisma.resellerShop.upsert({
    where: { handle: 'nordic-home' },
    create: {
      name: 'Nordic EcoLiving Essentials',
      handle: 'nordic-home',
      email: 'reseller.nordic@adera.io',
      password: hashedPassword,
      tier: 'SILVER',
      maxProfitMargin: 25.0,
      description: 'Smart robotics, micro-filtration systems, and modern kitchen innovations that directly empower clean water initiatives.',
      walletAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      balance: 620.00,
      totalSales: 21,
      isVerified: true
    },
    update: {}
  });

  // Fetch some products to seed into inventory
  const products = await prisma.product.findMany();
  if (products.length > 0) {
    for (const p of products.slice(0, 4)) {
      await prisma.resellerProduct.upsert({
        where: { shopId_productId: { shopId: shop1.id, productId: p.id } },
        create: {
          shopId: shop1.id,
          productId: p.id,
          basePrice: p.price,
          customPrice: parseFloat((p.price * 1.30).toFixed(2)),
          profitMargin: 30.0,
          isActive: true
        },
        update: {}
      });
    }

    for (const p of products.slice(3, 7)) {
      await prisma.resellerProduct.upsert({
        where: { shopId_productId: { shopId: shop2.id, productId: p.id } },
        create: {
          shopId: shop2.id,
          productId: p.id,
          basePrice: p.price,
          customPrice: parseFloat((p.price * 1.25).toFixed(2)),
          profitMargin: 25.0,
          isActive: true
        },
        update: {}
      });
    }
  }

  console.log('Reseller sample shops & inventory seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

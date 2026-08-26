const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const donorsList = [
  { name: "Mihira Kassa", amount: 10000, date: "Jul 08" },
  { name: "Mebrat Tadelle", amount: 3000, date: "Jul 17" },
  { name: "Daniel Gebrezgabiher", amount: 2580, date: "Jul 15" },
  { name: "Letemeskel Berhe", amount: 2000, date: "Jul 14" },
  { name: "Hailay Hagos", amount: 1700, date: "Jul 20" },
  { name: "Abera Hiluf", amount: 1660, date: "Jul 23" },
  { name: "Betelihem Gebremariam", amount: 1500, date: "Jul 11" },
  { name: "Mahlet Hagos", amount: 1400, date: "Jul 15" },
  { name: "Mebrhit T/Mariam", amount: 1400, date: "Jul 17" },
  { name: "Haile Gangul", amount: 1300, date: "Jul 15" },
  { name: "Asefa Meshesha", amount: 1200, date: "Jul 16" },
  { name: "Tsigereda Techane", amount: 1200, date: "Jul 21" },
  { name: "Gebremedhin Araya", amount: 1100, date: "Jul 16" },
  { name: "Weldebrhan Kiros", amount: 1000, date: "Jul 07" },
  { name: "Henok Gebretsadkan", amount: 1000, date: "Jul 22" },
  { name: "Million Hailu", amount: 910, date: "Jul 20" },
  { name: "Abrha Gebrecherkos", amount: 900, date: "Jul 05" },
  { name: "Masho Gebrehiwet", amount: 800, date: "Jul 05" },
  { name: "Mamit Zereabruk", amount: 800, date: "Jul 01" },
  { name: "Amanuel Gitet", amount: 800, date: "Jul 12" },
  { name: "Milat Gebreslassie", amount: 800, date: "Jul 25" },
  { name: "Desta Weldegebriel", amount: 800, date: "Jul 22" },
  { name: "Hailsh Asgedom", amount: 750, date: "Jul 20" },
  { name: "Yared Asefa", amount: 700, date: "Jul 08" },
  { name: "Tadelu Mebrahtu", amount: 700, date: "Jul 06" },
  { name: "Sofya Gessesew", amount: 700, date: "Jul 24" },
  { name: "Bereket Tsegay", amount: 600, date: "Jul 02" },
  { name: "Tiemtu Nega", amount: 600, date: "Jul 02" },
  { name: "Birtukan Gebremedhin", amount: 600, date: "Jul 06" },
  { name: "Desta Gebru", amount: 600, date: "Jul 14" },
  { name: "Alemu Asem", amount: 600, date: "Jul 25" },
  { name: "Tesfu Berhe", amount: 500, date: "Jul 01" },
];

const causesList = [
  {
    title: 'Build a Rural School in Tigray',
    description: 'Thousands of children in rural areas lack access to basic educational facilities. We are building a vibrant, humble classroom equipped with books and desks to provide a safe and optimistic learning environment for students.',
    image: '/causes/cause_school_1786200448807.jpg',
    goal: 50000,
    category: 'Education',
    urgency: 'Critical',
    status: 'APPROVED',
  },
  {
    title: 'Digital Literacy for Rural Students',
    description: 'Bringing laptops and internet connectivity to remote villages. This initiative introduces exciting digital tools to Ethiopian school children, opening up a world of knowledge and modern skills for their future.',
    image: '/causes/cause_edu_digital.jpg',
    goal: 12000,
    category: 'Education',
    urgency: 'New',
    status: 'APPROVED',
  },
  {
    title: 'University Scholarships for Rural Girls',
    description: 'Breaking the cycle of poverty by providing full university scholarships to brilliant young women from rural areas. Your donation covers tuition, books, and housing for a four-year degree.',
    image: '/causes/cause_edu_scholarship.jpg',
    goal: 18000,
    category: 'Education',
    urgency: 'Featured',
    status: 'APPROVED',
  },
  {
    title: 'Mobile Medical Clinic in Amhara',
    description: 'Our mobile medical clinic brings dedicated doctors and life-saving treatments directly to isolated rural communities. Your donation helps stock the clinic with essential medicine and clean medical supplies.',
    image: '/causes/cause_clinic_1786200473696.jpg',
    goal: 25000,
    category: 'Healthcare',
    urgency: 'Urgent',
    status: 'APPROVED',
  },
  {
    title: 'Maternity Ward Equipment Upgrade',
    description: 'Equipping a regional hospital with modern maternity care tools. We aim to drastically reduce maternal mortality rates by providing safe, sterile, and reliable equipment for expecting mothers.',
    image: '/causes/cause_clinic_1786200473696.jpg',
    goal: 30000,
    category: 'Healthcare',
    urgency: 'Featured',
    status: 'APPROVED',
  },
  {
    title: 'Rural Vaccination Drive',
    description: 'Funding mobile nurses to deliver life-saving vaccines to infants and children in the most isolated regions. This campaign protects vulnerable communities from preventable diseases.',
    image: '/causes/cause_health_vaccine.jpg',
    goal: 20000,
    category: 'Healthcare',
    urgency: 'Critical',
    status: 'APPROVED',
  },
  {
    title: 'Clean Water Well for Somali Region',
    description: 'Access to clean water is a fundamental human right. This project will drill a deep water well with a modern pump for a village, providing safe drinking water, reducing waterborne diseases, and bringing joy to the community.',
    image: '/causes/cause_water_1786200462466.jpg',
    goal: 15000,
    category: 'Clean Water',
    urgency: 'Featured',
    status: 'APPROVED',
  },
  {
    title: 'Solar Powered Water Pump Installation',
    description: 'Replacing outdated manual pumps with modern, sustainable solar-powered water systems in dry regions. This ensures a consistent, clean water supply without relying on expensive fuel.',
    image: '/causes/cause_water_pump.jpg',
    goal: 18000,
    category: 'Clean Water',
    urgency: 'Almost There',
    status: 'APPROVED',
  },
  {
    title: 'Flood Relief Efforts in Afar',
    description: 'Recent flash floods have devastated communities in the Afar region. We are mobilizing emergency teams to distribute tents, medical kits, and clean water to displaced families working together to rebuild.',
    image: '/causes/cause_disaster_flood.jpg',
    goal: 40000,
    category: 'Disaster Relief',
    urgency: 'Critical',
    status: 'APPROVED',
  },
  {
    title: 'Emergency Food Supplies for Somali Region',
    description: 'Severe droughts have left thousands without food. We are delivering vital emergency food supplies, nutritional supplements, and grain to mothers and children in severely affected rural villages.',
    image: '/causes/cause_disaster_food.jpg',
    goal: 60000,
    category: 'Disaster Relief',
    urgency: 'Urgent',
    status: 'APPROVED',
  },
  {
    title: 'Tree Planting Initiative in Oromia',
    description: 'Combating deforestation and climate change by planting thousands of indigenous tree saplings. Youth groups are leading this green revolution to restore lush landscapes and protect the soil.',
    image: '/causes/cause_environment_trees.jpg',
    goal: 8000,
    category: 'Environment',
    urgency: 'New',
    status: 'APPROVED',
  },
  {
    title: 'Solar Panels for Rural Clinics',
    description: 'Equipping off-grid health clinics with robust solar panel systems. Reliable electricity means vaccines stay cold, and doctors can perform life-saving procedures safely at night.',
    image: '/causes/cause_env_solar.jpg',
    goal: 22000,
    category: 'Environment',
    urgency: 'Featured',
    status: 'APPROVED',
  },
  {
    title: "Women's Skill Training Workshop",
    description: 'Empowering women in Sidama through a comprehensive skill training program. Funding goes toward purchasing modern sewing machines and computers to build focused, employable skills for economic freedom.',
    image: '/causes/cause_women_1786200616826.jpg',
    goal: 12000,
    category: 'Empowerment',
    urgency: 'Almost There',
    status: 'APPROVED',
  },
  {
    title: 'Sustainable Agriculture Tools',
    description: 'Empowering local farmers in Oromia with modern, sustainable farming tools and drought-resistant seeds to increase crop yields, ensure food security, and foster economic independence.',
    image: '/causes/cause_farming_1786200495727.jpg',
    goal: 10000,
    category: 'Empowerment',
    urgency: 'Featured',
    status: 'APPROVED',
  },
];

async function main() {
  console.log('--- Starting Adera Production Database Seeder ---');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('12345678', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aderafoundation.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
      name: 'Admin',
    },
    create: {
      email: 'admin@aderafoundation.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
    },
  });
  console.log('✅ Admin user created/ready:', admin.email);

  // 2. Causes / Posts
  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    for (const c of causesList) {
      await prisma.post.create({
        data: {
          ...c,
          authorId: admin.id,
          status: 'APPROVED',
          verifiedBadge: true,
          activationStatus: 'ACTIVE',
        },
      });
    }
    console.log(`✅ Seeded ${causesList.length} causes.`);
  } else {
    console.log(`ℹ️ Causes already exist (${existingPosts} found).`);
  }

  // 3. Donors
  const existingDonors = await prisma.donor.count();
  if (existingDonors === 0) {
    for (const d of donorsList) {
      await prisma.donor.create({ data: d });
    }
    console.log(`✅ Seeded ${donorsList.length} donors.`);
  } else {
    console.log(`ℹ️ Donors already exist (${existingDonors} found).`);
  }

  // 4. Crypto Payment Methods
  const existingPayments = await prisma.paymentMethod.count();
  if (existingPayments === 0) {
    const paymentMethods = [
      { network: 'Bitcoin', symbol: 'BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
      { network: 'Ethereum', symbol: 'ETH', address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe' },
      { network: 'Solana', symbol: 'SOL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      { network: 'Polygon', symbol: 'USDT', address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe' },
      { network: 'Ethereum', symbol: 'USDC', address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe' },
    ];
    for (const pm of paymentMethods) {
      await prisma.paymentMethod.create({ data: pm });
    }
    console.log(`✅ Seeded ${paymentMethods.length} payment methods.`);
  }

  // 5. Reseller Shops
  const resellerPassword = await bcrypt.hash('Panda232323@', 10);
  const shops = [
    {
      name: 'Apex Digital & Compute Hub',
      handle: 'apex-tech',
      email: 'reseller.apex@adera.io',
      password: resellerPassword,
      tier: 'PLATINUM',
      maxProfitMargin: 35.0,
      description: 'Official Platinum Partner delivering enterprise workstations, OLED displays, and mechanical peripherals.',
      walletAddress: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
      balance: 1420.5,
      totalSales: 48,
      isVerified: true,
    },
    {
      name: 'Horizon Athletics & Field Gear',
      handle: 'horizon-gear',
      email: 'reseller.horizon@adera.io',
      password: resellerPassword,
      tier: 'GOLD',
      maxProfitMargin: 30.0,
      description: 'Curated performance athletic footwear, therapeutic recovery tools, and deep-sea angling gear.',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      balance: 890.0,
      totalSales: 32,
      isVerified: true,
    },
    {
      name: 'Nordic EcoLiving Essentials',
      handle: 'nordic-home',
      email: 'reseller.nordic@adera.io',
      password: resellerPassword,
      tier: 'SILVER',
      maxProfitMargin: 25.0,
      description: 'Smart robotics, micro-filtration systems, and modern kitchen innovations.',
      walletAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      balance: 620.0,
      totalSales: 21,
      isVerified: true,
    },
  ];

  for (const s of shops) {
    await prisma.resellerShop.upsert({
      where: { handle: s.handle },
      update: {},
      create: s,
    });
  }
  console.log(`✅ Seeded reseller shops.`);

  console.log('--- Production Database Seed Complete! ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

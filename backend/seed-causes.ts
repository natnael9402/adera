import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Categorized Ethiopian Causes...');

  // 1. Get an Admin User to act as the Author
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Adera Foundation',
        email: 'admin@adera.com',
        password: 'hashedpassword',
        role: 'ADMIN',
        verified: true,
      },
    });
  }

  // 2. Clear existing causes
  await prisma.post.deleteMany();

  // 3. Insert 12 realistic Ethiopian causes perfectly categorized
  const causes = [
    // Education
    {
      title: 'Build a Rural School in Tigray',
      description: 'Thousands of children in rural areas lack access to basic educational facilities. We are building a vibrant, humble classroom equipped with books and desks to provide a safe and optimistic learning environment for students.',
      image: '/causes/cause_school_1786200448807.jpg',
      goal: 50000,
      category: 'Education',
      urgency: 'Critical',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Digital Literacy for Rural Students',
      description: 'Bringing laptops and internet connectivity to remote villages. This initiative introduces exciting digital tools to Ethiopian school children, opening up a world of knowledge and modern skills for their future.',
      image: '/causes/cause_edu_digital.jpg',
      goal: 12000,
      category: 'Education',
      urgency: 'New',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'University Scholarships for Rural Girls',
      description: 'Breaking the cycle of poverty by providing full university scholarships to brilliant young women from rural areas. Your donation covers tuition, books, and housing for a four-year degree.',
      image: '/causes/cause_edu_scholarship.jpg',
      goal: 18000,
      category: 'Education',
      urgency: 'Featured',
      status: 'APPROVED',
      authorId: admin.id,
    },

    // Healthcare
    {
      title: 'Mobile Medical Clinic in Amhara',
      description: 'Our mobile medical clinic brings dedicated doctors and life-saving treatments directly to isolated rural communities. Your donation helps stock the clinic with essential medicine and clean medical supplies.',
      image: '/causes/cause_clinic_1786200473696.jpg',
      goal: 25000,
      category: 'Healthcare',
      urgency: 'Urgent',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Maternity Ward Equipment Upgrade',
      description: 'Equipping a regional hospital with modern maternity care tools. We aim to drastically reduce maternal mortality rates by providing safe, sterile, and reliable equipment for expecting mothers.',
      image: '/causes/cause_clinic_1786200473696.jpg', // Using existing clinic image as fallback
      goal: 30000,
      category: 'Healthcare',
      urgency: 'Featured',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Rural Vaccination Drive',
      description: 'Funding mobile nurses to deliver life-saving vaccines to infants and children in the most isolated regions. This campaign protects vulnerable communities from preventable diseases.',
      image: '/causes/cause_health_vaccine.jpg', 
      goal: 20000,
      category: 'Healthcare',
      urgency: 'Critical',
      status: 'APPROVED',
      authorId: admin.id,
    },

    // Clean Water
    {
      title: 'Clean Water Well for Somali Region',
      description: 'Access to clean water is a fundamental human right. This project will drill a deep water well with a modern pump for a village, providing safe drinking water, reducing waterborne diseases, and bringing joy to the community.',
      image: '/causes/cause_water_1786200462466.jpg',
      goal: 15000,
      category: 'Clean Water',
      urgency: 'Featured',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Solar Powered Water Pump Installation',
      description: 'Replacing outdated manual pumps with modern, sustainable solar-powered water systems in dry regions. This ensures a consistent, clean water supply without relying on expensive fuel.',
      image: '/causes/cause_water_pump.jpg',
      goal: 18000,
      category: 'Clean Water',
      urgency: 'Almost There',
      status: 'APPROVED',
      authorId: admin.id,
    },

    // Disaster Relief
    {
      title: 'Flood Relief Efforts in Afar',
      description: 'Recent flash floods have devastated communities in the Afar region. We are mobilizing emergency teams to distribute tents, medical kits, and clean water to displaced families working together to rebuild.',
      image: '/causes/cause_disaster_flood.jpg',
      goal: 40000,
      category: 'Disaster Relief',
      urgency: 'Critical',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Emergency Food Supplies for Somali Region',
      description: 'Severe droughts have left thousands without food. We are delivering vital emergency food supplies, nutritional supplements, and grain to mothers and children in severely affected rural villages.',
      image: '/causes/cause_disaster_food.jpg',
      goal: 60000,
      category: 'Disaster Relief',
      urgency: 'Urgent',
      status: 'APPROVED',
      authorId: admin.id,
    },

    // Environment
    {
      title: 'Tree Planting Initiative in Oromia',
      description: 'Combating deforestation and climate change by planting thousands of indigenous tree saplings. Youth groups are leading this green revolution to restore lush landscapes and protect the soil.',
      image: '/causes/cause_environment_trees.jpg',
      goal: 8000,
      category: 'Environment',
      urgency: 'New',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Solar Panels for Rural Clinics',
      description: 'Equipping off-grid health clinics with robust solar panel systems. Reliable electricity means vaccines stay cold, and doctors can perform life-saving procedures safely at night.',
      image: '/causes/cause_env_solar.jpg',
      goal: 22000,
      category: 'Environment',
      urgency: 'Featured',
      status: 'APPROVED',
      authorId: admin.id,
    },

    // Empowerment
    {
      title: 'Women\'s Skill Training Workshop',
      description: 'Empowering women in Sidama through a comprehensive skill training program. Funding goes toward purchasing modern sewing machines and computers to build focused, employable skills for economic freedom.',
      image: '/causes/cause_women_1786200616826.jpg',
      goal: 12000,
      category: 'Empowerment',
      urgency: 'Almost There',
      status: 'APPROVED',
      authorId: admin.id,
    },
    {
      title: 'Sustainable Agriculture Tools',
      description: 'Empowering local farmers in Oromia with modern, sustainable farming tools and drought-resistant seeds to increase crop yields, ensure food security, and foster economic independence.',
      image: '/causes/cause_farming_1786200495727.jpg',
      goal: 10000,
      category: 'Empowerment',
      urgency: 'Featured',
      status: 'APPROVED',
      authorId: admin.id,
    },
  ];

  for (const cause of causes) {
    await prisma.post.create({ data: cause as any });
  }

  console.log('Successfully seeded 12 fully categorized Ethiopian causes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

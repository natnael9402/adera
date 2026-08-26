import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const donors = [
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

async function main() {
  await prisma.donor.deleteMany({});
  for (const donor of donors) {
    await prisma.donor.create({
      data: donor,
    });
  }
  console.log(`Successfully seeded ${donors.length} donors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

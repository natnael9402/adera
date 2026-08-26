import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aderafoundation.org' },
    update: {},
    create: {
      email: 'admin@aderafoundation.org',
      name: 'Admin',
      password: hashed,
      role: 'ADMIN',
      verified: true,
    },
  });
  console.log('Admin user created:', admin.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

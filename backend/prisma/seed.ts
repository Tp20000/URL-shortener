import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Admin User ─────────────────────────────────
  const adminEmail = 'admin@urlshort.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@12345', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin created: ${admin.email} / Admin@12345`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // ─── Create Test User ──────────────────────────────────
  const testEmail = 'user@urlshort.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('User@12345', 12);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'USER',
      },
    });
    console.log(`✅ User created: ${user.email} / User@12345`);
  } else {
    console.log(`ℹ️  User already exists: ${testEmail}`);
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
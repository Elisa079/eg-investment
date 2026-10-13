import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPhone = '+25479491677';

  const existing = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('ChangeMe!123', 12);
    const admin = await prisma.user.create({
      data: {
        fullName: 'EG Admin',
        username: 'admin',
        email: 'admin@eginvestment.example',
        phone: adminPhone,
        passwordHash,
        isMember: true,
      },
    });
    console.log('Admin user created:', admin.id);
  } else {
    console.log('Admin already exists');
  }

  // Create sample tasks
  const now = new Date();
  const later = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  await prisma.task.upsert({
    where: { title: 'Upload a product photo' },
    update: {},
    create: {
      title: 'Upload a product photo',
      description: 'Take a clear photo of the product and upload it.',
      submissionType: 'photo',
      rewardAmount: 10,
      startAt: now,
      endAt: later,
      dailyMaxPerUser: 200,
    },
  });

  await prisma.task.upsert({
    where: { title: 'Short video testimonial' },
    update: {},
    create: {
      title: 'Short video testimonial',
      description: 'Record a 30-60s video about your experience.',
      submissionType: 'video',
      rewardAmount: 50,
      startAt: now,
      endAt: later,
      dailyMaxPerUser: 200,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

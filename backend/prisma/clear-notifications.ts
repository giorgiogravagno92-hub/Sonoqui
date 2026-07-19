import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany({});
  await prisma.interviewRequest.deleteMany({});
  console.log('Cleared all notifications and interview requests!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

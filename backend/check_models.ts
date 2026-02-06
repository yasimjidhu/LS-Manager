import { PrismaClient } from '@prisma/client';

async function check() {
    const prisma = new PrismaClient();
    console.log('Available models in Prisma Client:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
    await prisma.$disconnect();
}

check();

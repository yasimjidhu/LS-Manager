
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        const userCount = await prisma.user.count();
        console.log(`📊 User count: ${userCount}`);

        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('👥 Users:', users);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

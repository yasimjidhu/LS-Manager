
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const counts = await Promise.all([
            prisma.user.count(),
            prisma.employee.count(),
            prisma.job.count(),
            prisma.event.count(),
            prisma.inventoryItem.count(),
            prisma.quotation.count(),
            prisma.invoice.count()
        ]);

        console.log('--- Database Counts ---');
        console.log(`Users: ${counts[0]}`);
        console.log(`Employees: ${counts[1]}`);
        console.log(`Jobs: ${counts[2]}`);
        console.log(`Events: ${counts[3]}`);
        console.log(`Inventory Items: ${counts[4]}`);
        console.log(`Quotations: ${counts[5]}`);
        console.log(`Invoices: ${counts[6]}`);
        console.log('-----------------------');

    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

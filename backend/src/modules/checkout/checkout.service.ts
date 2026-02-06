import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
    constructor(private prisma: PrismaService) { }

    async checkout(dto: CreateCheckoutDto) {
        const { jobId, items, assignedToId } = dto;
        const itemIds = items.map(i => i.itemId);

        // Verify Job
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new BadRequestException('Job not found');

        // Verify Items & Status
        const inventoryItems = await this.prisma.inventoryItem.findMany({
            where: { id: { in: itemIds } }
        });

        if (inventoryItems.length !== itemIds.length) {
            throw new BadRequestException('Some items not found');
        }

        // Transaction
        return this.prisma.$transaction(async (prisma) => {
            for (const item of items) {
                const invItem = inventoryItems.find(i => i.id === item.itemId);
                if (!invItem) continue;

                // Calculate current checked out quantity
                const aggregates = await prisma.checkoutLog.aggregate({
                    where: {
                        itemId: item.itemId,
                        status: 'CHECKED_OUT'
                    },
                    _sum: { quantity: true }
                });

                const currentOut = aggregates._sum.quantity || 0;
                const totalOutAfterThis = currentOut + item.quantity;

                if (totalOutAfterThis > invItem.quantity) {
                    throw new BadRequestException(`Insufficient stock for ${invItem.name}. Available: ${invItem.quantity - currentOut}, requested: ${item.quantity}`);
                }

                // Update item status: only 'IN_USE' if all units are gone
                await prisma.inventoryItem.update({
                    where: { id: item.itemId },
                    data: {
                        status: totalOutAfterThis >= invItem.quantity ? 'IN_USE' : 'AVAILABLE'
                    }
                });
            }

            // Create Logs
            const logs = items.map(item => ({
                jobId,
                itemId: item.itemId,
                assignedToId,
                status: 'CHECKED_OUT' as const,
                quantity: item.quantity
            }));

            await prisma.checkoutLog.createMany({
                data: logs
            });

            return { success: true, count: itemIds.length };
        });
    }

    async getHistory() {
        return this.prisma.checkoutLog.findMany({
            include: {
                job: true,
                item: true,
                assignedTo: true
            },
            orderBy: { checkedOutAt: 'desc' }
        });
    }
}

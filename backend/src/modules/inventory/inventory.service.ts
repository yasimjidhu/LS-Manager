import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { CheckInItemDto } from './dto/checkin-item.dto';
import { ItemStatus, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async create(createInventoryItemDto: CreateInventoryItemDto) {
        // Generate a simple unique QR code if not provided
        const qrCode = createInventoryItemDto.qrCode || `EQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.inventoryItem.create({
            data: {
                ...createInventoryItemDto,
                qrCode,
            },
            include: {
                category: true,
            }
        });
    }

    async checkout(checkoutItemDto: CheckoutItemDto, userId: string) {
        // 1. Get Item with active checkouts
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id: checkoutItemDto.itemId },
            include: {
                checkouts: {
                    where: { status: 'CHECKED_OUT' }
                }
            }
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        // 3. Business Logic: Status Check
        if (item.status === 'MAINTENANCE' || item.status === 'DAMAGED' || item.status === 'RETIRED') {
            throw new NotFoundException(`Item is currently ${item.status}. Cannot check out.`);
        }

        if (item.quantity === 1 && item.status === 'IN_USE') {
            throw new NotFoundException(`This item is already checked out for another job.`);
        }

        // 4. Calculate Availability
        const currentlyCheckedOut = item.checkouts.reduce((sum, log) => sum + log.quantity, 0);
        const available = item.quantity - currentlyCheckedOut;

        if (available < checkoutItemDto.quantity) {
            throw new NotFoundException(`Insufficient stock. Available: ${available}, Requested: ${checkoutItemDto.quantity}`);
        }

        // 5. Resolve AssignedTo
        let assignedToId = checkoutItemDto.assignedToId;
        if (!assignedToId) {
            const employee = await this.prisma.employee.findUnique({ where: { userId } });
            if (employee) assignedToId = employee.id;
        }

        // 6. Perform Transaction: Update Item Status + Create Checkout Log
        return this.prisma.$transaction(async (tx) => {
            // Update status only if it's a serialized single-unit item
            if (item.quantity === 1) {
                await tx.inventoryItem.update({
                    where: { id: item.id },
                    data: { status: 'IN_USE' }
                });
            }

            // Create Checkout Log
            return tx.checkoutLog.create({
                data: {
                    jobId: checkoutItemDto.jobId,
                    itemId: checkoutItemDto.itemId,
                    quantity: checkoutItemDto.quantity,
                    assignedToId,
                    status: 'CHECKED_OUT'
                }
            });
        });
    }

    async checkIn(checkInItemDto: CheckInItemDto) {
        const logs = await this.prisma.checkoutLog.findMany({
            where: {
                jobId: checkInItemDto.jobId,
                itemId: checkInItemDto.itemId,
                status: 'CHECKED_OUT'
            },
            orderBy: { createdAt: 'asc' }
        });

        if (logs.length === 0) {
            throw new NotFoundException('No active checkout found for this item and job');
        }

        let remainingToReturn = checkInItemDto.quantity;

        return this.prisma.$transaction(async (tx) => {
            for (const log of logs) {
                if (remainingToReturn <= 0) break;

                if (log.quantity <= remainingToReturn) {
                    await tx.checkoutLog.update({
                        where: { id: log.id },
                        data: {
                            status: 'RETURNED',
                            checkedInAt: new Date()
                        }
                    });
                    remainingToReturn -= log.quantity;
                } else {
                    await tx.checkoutLog.update({
                        where: { id: log.id },
                        data: { quantity: log.quantity - remainingToReturn }
                    });

                    await tx.checkoutLog.create({
                        data: {
                            jobId: log.jobId,
                            itemId: log.itemId,
                            assignedToId: log.assignedToId,
                            quantity: remainingToReturn,
                            status: 'RETURNED',
                            checkedInAt: new Date(),
                            checkedOutAt: log.checkedOutAt
                        }
                    });
                    remainingToReturn = 0;
                }
            }

            if (remainingToReturn > 0) {
                throw new NotFoundException(`Cannot return ${checkInItemDto.quantity}. Only ${checkInItemDto.quantity - remainingToReturn} checks found for this job.`);
            }

            const item = await tx.inventoryItem.findUnique({ where: { id: checkInItemDto.itemId } });
            if (item && item.quantity === 1) {
                const remainingCheckout = await tx.checkoutLog.count({
                    where: {
                        itemId: item.id,
                        status: 'CHECKED_OUT'
                    }
                });

                if (remainingCheckout === 0) {
                    await tx.inventoryItem.update({
                        where: { id: item.id },
                        data: { status: 'AVAILABLE' }
                    });
                }
            }

            return { message: 'Items returned successfully' };
        });
    }

    async findAll(params?: {
        search?: string;
        categoryId?: string;
        status?: ItemStatus;
        page?: number;
        limit?: number;
    }) {
        const { search, categoryId, status, page = 1, limit = 100 } = params || {};

        const where: Prisma.InventoryItemWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { qrCode: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId;
        }

        if (status) {
            where.status = status;
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                where,
                include: {
                    category: true,
                    checkouts: {
                        where: {
                            status: 'CHECKED_OUT'
                        },
                        select: {
                            quantity: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                take: Number(limit),
                skip: Number(skip),
            }),
            this.prisma.inventoryItem.count({ where })
        ]);

        const data = items.map(item => {
            const checkedOutQuantity = item.checkouts.reduce((sum, log) => sum + log.quantity, 0);
            return {
                ...item,
                checkedOutQuantity
            };
        });

        return {
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findOne(id: string) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                category: true,
                maintenanceLogs: true,
                checkouts: {
                    where: {
                        status: 'CHECKED_OUT'
                    }
                }
            }
        });

        if (!item) {
            throw new NotFoundException(`Inventory item with ID ${id} not found`);
        }

        const checkedOutQuantity = item.checkouts.reduce((sum, log) => sum + log.quantity, 0);

        return {
            ...item,
            checkedOutQuantity
        };
    }

    async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto) {
        await this.findOne(id); // Ensure exists

        return this.prisma.inventoryItem.update({
            where: { id },
            data: updateInventoryItemDto,
            include: {
                category: true,
            }
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists
        return this.prisma.inventoryItem.delete({
            where: { id },
        });
    }

    async getCategories() {
        return this.prisma.inventoryCategory.findMany();
    }

    async createCategory(createCategoryDto: CreateCategoryDto) {
        return this.prisma.inventoryCategory.create({
            data: {
                name: createCategoryDto.name,
                description: createCategoryDto.description,
            }
        });
    }

    async getConflicts() {
        // 1. Get all accepted quotations and their items
        const acceptedQuotes = await this.prisma.quotation.findMany({
            where: {
                status: 'ACCEPTED',
            },
            include: {
                event: true,
                items: {
                    include: {
                        item: true,
                    }
                }
            }
        });

        // 2. Map items to their timeline of usage
        const inventory = await this.prisma.inventoryItem.findMany();
        const conflicts: any[] = [];

        for (const item of inventory) {
            const usageByDate: Record<string, number> = {};

            // Track usage from quotes
            for (const quote of acceptedQuotes) {
                const quoteItem = quote.items.find(i => i.itemId === item.id);
                if (quoteItem) {
                    const start = new Date(quote.event.startDate);
                    const end = new Date(quote.event.endDate);

                    // Iterate through each day of the event
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dateStr = d.toISOString().split('T')[0];
                        usageByDate[dateStr] = (usageByDate[dateStr] || 0) + quoteItem.quantity;
                    }
                }
            }

            // Check for overbooking
            const overbookedDates = Object.entries(usageByDate)
                .filter(([_, qty]) => qty > item.quantity)
                .map(([date, qty]) => ({
                    date,
                    requested: qty,
                    available: item.quantity,
                    shortage: qty - item.quantity
                }));

            if (overbookedDates.length > 0) {
                conflicts.push({
                    itemId: item.id,
                    itemName: item.name,
                    conflicts: overbookedDates
                });
            }
        }

        return conflicts;
    }
}

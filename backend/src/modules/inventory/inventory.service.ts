import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
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

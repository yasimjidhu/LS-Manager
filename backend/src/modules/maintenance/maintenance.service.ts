import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';

@Injectable()
export class MaintenanceService {
    constructor(private prisma: PrismaService) { }

    async create(createMaintenanceLogDto: CreateMaintenanceLogDto, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const log = await tx.maintenanceLog.create({
                data: {
                    description: createMaintenanceLogDto.description,
                    cost: createMaintenanceLogDto.cost || 0,
                    status: createMaintenanceLogDto.status,
                    itemId: createMaintenanceLogDto.itemId,
                    reportedById: userId
                }
            });

            // Update item status
            await tx.inventoryItem.update({
                where: { id: createMaintenanceLogDto.itemId },
                data: { status: createMaintenanceLogDto.status }
            });

            return log;
        });
    }

    async findAllByItem(itemId: string) {
        return this.prisma.maintenanceLog.findMany({
            where: { itemId },
            include: {
                reportedBy: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findAll() {
        return this.prisma.maintenanceLog.findMany({
            include: {
                item: true,
                reportedBy: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        employee: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async update(id: string, data: Partial<CreateMaintenanceLogDto>) {
        return this.prisma.maintenanceLog.update({
            where: { id },
            data: {
                description: data.description,
                cost: data.cost,
                status: data.status
            }
        });
    }

    async resolve(id: string) {
        const log = await this.prisma.maintenanceLog.findUnique({
            where: { id },
            include: { item: true }
        });

        if (!log) throw new NotFoundException('Maintenance log not found');

        return this.prisma.$transaction(async (tx) => {
            // Update the log
            const updatedLog = await tx.maintenanceLog.update({
                where: { id },
                data: {
                    resolvedAt: new Date(),
                    status: 'AVAILABLE'
                }
            });

            // Update the item status
            await tx.inventoryItem.update({
                where: { id: log.itemId },
                data: { status: 'AVAILABLE' }
            });

            return updatedLog;
        });
    }

    async remove(id: string) {
        return this.prisma.maintenanceLog.delete({
            where: { id }
        });
    }
}

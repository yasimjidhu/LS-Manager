import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';

@Injectable()
export class MaintenanceService {
    constructor(private prisma: PrismaService) { }

    async create(createMaintenanceLogDto: CreateMaintenanceLogDto, userId: string) {
        return this.prisma.maintenanceLog.create({
            data: {
                description: createMaintenanceLogDto.description,
                cost: createMaintenanceLogDto.cost || 0,
                status: createMaintenanceLogDto.status,
                itemId: createMaintenanceLogDto.itemId,
                reportedById: userId
            }
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
                reportedBy: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

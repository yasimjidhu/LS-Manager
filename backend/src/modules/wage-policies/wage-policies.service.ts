import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePieceRateDto } from './dto/create-piece-rate.dto';
import { CreateRoleRateDto } from './dto/create-role-rate.dto';

@Injectable()
export class WagePoliciesService {
    constructor(private prisma: PrismaService) { }

    // Piece Rates
    async findAllPieceRates(params?: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 10, search } = params || {};
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.item = {
                name: { contains: search, mode: 'insensitive' }
            };
        }

        const [pieceRates, total] = await Promise.all([
            this.prisma.itemPieceRate.findMany({
                where,
                include: { item: true },
                skip: Number(skip),
                take: Number(limit)
            }),
            this.prisma.itemPieceRate.count({ where })
        ]);

        return {
            data: pieceRates,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createPieceRate(dto: CreatePieceRateDto) {
        return this.prisma.itemPieceRate.upsert({
            where: { itemId: dto.itemId },
            update: { ratePerUnit: dto.ratePerUnit },
            create: {
                itemId: dto.itemId,
                ratePerUnit: dto.ratePerUnit
            }
        });
    }

    async updatePieceRate(id: string, dto: Partial<CreatePieceRateDto>) {
        return this.prisma.itemPieceRate.update({
            where: { id },
            data: {
                ...(dto.ratePerUnit && { ratePerUnit: dto.ratePerUnit }),
                ...(dto.itemId && { itemId: dto.itemId })
            }
        });
    }

    async deletePieceRate(id: string) {
        return this.prisma.itemPieceRate.delete({
            where: { id }
        });
    }

    // Role Rates
    async findAllRoleRates(params?: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 10, search } = params || {};
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.roleName = { contains: search, mode: 'insensitive' };
        }

        const [roleRates, total] = await Promise.all([
            // @ts-ignore
            this.prisma.globalRoleRate.findMany({
                where,
                skip: Number(skip),
                take: Number(limit)
            }),
            // @ts-ignore
            this.prisma.globalRoleRate.count({ where })
        ]);

        return {
            data: roleRates,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createRoleRate(dto: CreateRoleRateDto) {
        // @ts-ignore
        return this.prisma.globalRoleRate.upsert({
            where: {
                roleName_wageType: {
                    roleName: dto.roleName,
                    wageType: dto.wageType
                }
            },
            update: {
                rate: dto.rate,
                description: dto.description
            },
            create: {
                roleName: dto.roleName,
                wageType: dto.wageType,
                rate: dto.rate,
                description: dto.description
            }
        });
    }

    async updateRoleRate(id: string, dto: Partial<CreateRoleRateDto>) {
        // @ts-ignore
        return this.prisma.globalRoleRate.update({
            where: { id },
            data: dto
        });
    }

    async deleteRoleRate(id: string) {
        // @ts-ignore
        return this.prisma.globalRoleRate.delete({
            where: { id }
        });
    }
}

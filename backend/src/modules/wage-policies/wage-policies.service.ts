import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePieceRateDto } from './dto/create-piece-rate.dto';
import { CreateRoleRateDto } from './dto/create-role-rate.dto';

@Injectable()
export class WagePoliciesService {
    constructor(private prisma: PrismaService) { }

    // Piece Rates
    async findAllPieceRates() {
        return this.prisma.itemPieceRate.findMany({
            include: { item: true }
        });
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
    async findAllRoleRates() {
        // @ts-ignore - access to table that might not be in client yet
        return this.prisma.globalRoleRate.findMany();
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

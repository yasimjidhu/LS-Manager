import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { WagePoliciesService } from './wage-policies.service';
import { CreatePieceRateDto } from './dto/create-piece-rate.dto';
import { CreateRoleRateDto } from './dto/create-role-rate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('wage-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WagePoliciesController {
    constructor(private readonly wagePoliciesService: WagePoliciesService) { }

    @Get('piece-rates')
    @Roles(Role.ADMIN)
    async getPieceRates() {
        return this.wagePoliciesService.findAllPieceRates();
    }

    @Post('piece-rates')
    @Roles(Role.ADMIN)
    async createPieceRate(@Body() dto: CreatePieceRateDto) {
        return this.wagePoliciesService.createPieceRate(dto);
    }


    @Patch('piece-rates/:id')
    @Roles(Role.ADMIN)
    async updatePieceRate(@Param('id') id: string, @Body() dto: Partial<CreatePieceRateDto>) {
        return this.wagePoliciesService.updatePieceRate(id, dto);
    }

    @Delete('piece-rates/:id')
    @Roles(Role.ADMIN)
    async deletePieceRate(@Param('id') id: string) {
        return this.wagePoliciesService.deletePieceRate(id);
    }

    @Get('role-rates')
    @Roles(Role.ADMIN)
    async getRoleRates() {
        return this.wagePoliciesService.findAllRoleRates();
    }

    @Post('role-rates')
    @Roles(Role.ADMIN)
    async createRoleRate(@Body() dto: CreateRoleRateDto) {
        return this.wagePoliciesService.createRoleRate(dto);
    }


    @Patch('role-rates/:id')
    @Roles(Role.ADMIN)
    async updateRoleRate(@Param('id') id: string, @Body() dto: Partial<CreateRoleRateDto>) {
        return this.wagePoliciesService.updateRoleRate(id, dto);
    }

    @Delete('role-rates/:id')
    @Roles(Role.ADMIN)
    async deleteRoleRate(@Param('id') id: string) {
        return this.wagePoliciesService.deleteRoleRate(id);
    }
}

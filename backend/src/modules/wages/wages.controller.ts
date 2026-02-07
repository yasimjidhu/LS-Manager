import { Controller, Get, Post, Param, Query, UseGuards, Put, Body, Patch, Req, Res } from '@nestjs/common';
import { WagesService } from './wages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as express from 'express';

@Controller('wages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WagesController {
    constructor(private readonly wagesService: WagesService) { }

    @Get('export')
    @Roles(Role.ADMIN)
    async exportWages(
        @Res() res: express.Response,
        @Query('employeeId') employeeId?: string,
        @Query('month') month?: string,
        @Query('status') status?: 'PAID' | 'UNPAID'
    ) {
        const csv = await this.wagesService.exportWages({ employeeId, month, status });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=wages_export_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    async getAllWages(
        @Req() req: any,
        @Query('employeeId') employeeId?: string,
        @Query('month') month?: string, // YYYY-MM
        @Query('status') status?: 'PAID' | 'UNPAID'
    ) {
        let finalEmployeeId = employeeId;

        // If employee or supervisor is requesting, force it to be their own ID by default
        // Admins can see anyone. Supervisors/Employees see themselves.
        if (req.user.role === Role.EMPLOYEE || req.user.role === Role.SUPERVISOR) {
            const employee = await this.wagesService.findEmployeeByUserId(req.user.userId);
            if (!employee) return [];
            finalEmployeeId = employee.id;
        }

        return this.wagesService.findAll({ employeeId: finalEmployeeId, month, status });
    }

    @Get('stats')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    async getStats(@Req() req: any) {
        if (req.user.role === Role.EMPLOYEE || req.user.role === Role.SUPERVISOR) {
            const employee = await this.wagesService.findEmployeeByUserId(req.user.userId);
            if (!employee) return { totalPaid: 0, totalPending: 0, thisMonth: 0 };
            return this.wagesService.getStatsForEmployee(employee.id);
        }
        return this.wagesService.getStats();
    }

    @Put(':id/pay')
    @Roles(Role.ADMIN)
    async markAsPaid(@Param('id') id: string) {
        return this.wagesService.markAsPaid(id);
    }

    @Post('recalculate')
    @Roles(Role.ADMIN)
    async recalculate() {
        return this.wagesService.recalculateAll();
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.wagesService.updateWageStatus(id, status);
    }
    @Patch(':id')
    @Roles(Role.ADMIN)
    async updateWage(@Param('id') id: string, @Body() body: { amount?: number; description?: string }) {
        return this.wagesService.updateWage(id, body);
    }
}

import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('admin')
    @Roles('ADMIN')
    async getAdminAnalytics(@Query('dateRange') dateRange: string = 'this-month') {
        return this.analyticsService.getAdminAnalytics(dateRange);
    }

    @Get('supervisor')
    @Roles('ADMIN', 'SUPERVISOR')
    async getSupervisorAnalytics(@Query('dateRange') dateRange: string = 'this-month') {
        return this.analyticsService.getSupervisorAnalytics(dateRange);
    }

    @Get('employee')
    @Roles('ADMIN', 'SUPERVISOR', 'EMPLOYEE')
    async getEmployeeAnalytics(
        @Request() req,
        @Query('dateRange') dateRange: string = 'this-month'
    ) {
        // Get employee ID from the userId
        const employee = await this.analyticsService.findEmployeeByUserId(req.user.userId);
        if (!employee) {
            return { summary: { totalApplications: 0, completedJobs: 0, upcomingJobs: 0 }, recentActivity: [] };
        }
        return this.analyticsService.getEmployeeAnalytics(employee.id, dateRange);
    }

    @Get('dashboard')
    async getDashboardAnalytics(@Request() req, @Query('dateRange') dateRange: string = 'this-month') {
        const role = req.user.role;

        switch (role) {
            case 'ADMIN':
                return this.analyticsService.getAdminAnalytics(dateRange);
            case 'SUPERVISOR':
                return this.analyticsService.getSupervisorAnalytics(dateRange);
            case 'EMPLOYEE':
                const employee = await this.analyticsService.findEmployeeByUserId(req.user.userId);
                if (!employee) {
                    return { summary: { totalApplications: 0, completedJobs: 0, upcomingJobs: 0 }, recentActivity: [] };
                }
                return this.analyticsService.getEmployeeAnalytics(employee.id, dateRange);
            default:
                throw new Error('Invalid role');
        }
    }
}

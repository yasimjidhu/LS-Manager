import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JobRequestsService } from './job-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('job-requests')
@UseGuards(JwtAuthGuard)
export class JobRequestsController {
    constructor(private readonly jobRequestsService: JobRequestsService) { }

    @Post(':jobId')
    create(@Param('jobId') jobId: string, @Request() req) {
        return this.jobRequestsService.create(jobId, req.user.userId);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string) {
        return this.jobRequestsService.approve(id);
    }

    @Patch(':id/reject')
    reject(@Param('id') id: string, @Body('reason') reason: string) {
        return this.jobRequestsService.reject(id, reason);
    }

    @Get()
    findAll(@Query('jobId') jobId?: string, @Query('employeeId') employeeId?: string) {
        return this.jobRequestsService.findAll(jobId, employeeId);
    }
}

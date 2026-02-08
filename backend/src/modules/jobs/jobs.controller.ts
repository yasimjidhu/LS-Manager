import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Get('stats')
    getStats() {
        return this.jobsService.getStats();
    }

    @Post()
    create(@Body() createJobDto: CreateJobDto, @Request() req) {
        return this.jobsService.create(createJobDto, req.user.userId);
    }

    @Post(':id/clone')
    clone(@Param('id') id: string, @Request() req) {
        return this.jobsService.clone(id, req.user.userId);
    }

    @Get()
    findAll(
        @Request() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('date') date?: string,
        @Query('viewMode') viewMode?: string
    ) {
        return this.jobsService.findAll({
            page: page ? +page : 1,
            limit: limit ? +limit : 50,
            search,
            date,
            viewMode,
            userId: req.user.userId
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
        return this.jobsService.update(id, updateJobDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.jobsService.remove(id);
    }
}

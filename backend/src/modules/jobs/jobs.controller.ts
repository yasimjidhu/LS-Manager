import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    create(@Body() createJobDto: CreateJobDto, @Request() req) {
        return this.jobsService.create(createJobDto, req.user.userId);
    }

    @Post(':id/clone')
    clone(@Param('id') id: string, @Request() req) {
        return this.jobsService.clone(id, req.user.userId);
    }

    @Get()
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.jobsService.findAll(page, limit);
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

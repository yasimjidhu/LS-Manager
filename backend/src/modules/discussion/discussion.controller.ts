import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { CreateJobMessageDto } from './dto/create-job-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('discussion')
@UseGuards(JwtAuthGuard)
export class DiscussionController {
    constructor(private readonly discussionService: DiscussionService) { }

    @Post()
    create(@Body() createJobMessageDto: CreateJobMessageDto, @Request() req) {
        return this.discussionService.create(createJobMessageDto, req.user.userId);
    }

    @Get('job/:jobId')
    findAllByJob(@Param('jobId') jobId: string) {
        return this.discussionService.findAllByJob(jobId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.discussionService.remove(id, req.user.userId);
    }
}

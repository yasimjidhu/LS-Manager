import { Controller } from '@nestjs/common';
import { JobAssignmentsService } from './job-assignments.service';

@Controller('job-assignments')
export class JobAssignmentsController {
    constructor(private readonly jobAssignmentsService: JobAssignmentsService) { }
}

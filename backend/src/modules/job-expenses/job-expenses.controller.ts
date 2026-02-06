import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { JobExpensesService } from './job-expenses.service';
import { CreateJobExpenseDto } from './dto/create-job-expense.dto';
import { UpdateJobExpenseDto } from './dto/update-job-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('job-expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobExpensesController {
  constructor(private readonly jobExpensesService: JobExpensesService) { }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  create(@Body() createJobExpenseDto: CreateJobExpenseDto, @Req() req: any) {
    return this.jobExpensesService.create(createJobExpenseDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  findAll(@Query('jobId') jobId?: string) {
    if (jobId) {
      return this.jobExpensesService.findAllByJob(jobId);
    }
    return this.jobExpensesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  findOne(@Param('id') id: string) {
    return this.jobExpensesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  update(@Param('id') id: string, @Body() updateJobExpenseDto: UpdateJobExpenseDto) {
    return this.jobExpensesService.update(id, updateJobExpenseDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.jobExpensesService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobExpenseDto } from './dto/create-job-expense.dto';
import { UpdateJobExpenseDto } from './dto/update-job-expense.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JobExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(createJobExpenseDto: CreateJobExpenseDto, userId: string) {
    try {
      console.log('Creating expense:', createJobExpenseDto);
      return await (this.prisma as any).jobExpense.create({
        data: {
          ...createJobExpenseDto,
          recordedById: userId
        }
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  /* 
   * Find all expenses for a specific job
   * Using query param or passed filter object if typical controller structure
   * Here assuming a simple fetch all or filtered by jobId if provided in controller
   */
  async findAllByJob(jobId: string) {
    return (this.prisma as any).jobExpense.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: { recordedBy: true }
    });
  }

  async findAll() {
    return (this.prisma as any).jobExpense.findMany({
      orderBy: { createdAt: 'desc' },
      include: { job: true, recordedBy: true }
    });
  }

  async findOne(id: string) {
    const expense = await (this.prisma as any).jobExpense.findUnique({
      where: { id },
      include: { job: true, recordedBy: true }
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  // Optional: Update
  async update(id: string, updateJobExpenseDto: UpdateJobExpenseDto) {
    return (this.prisma as any).jobExpense.update({
      where: { id },
      data: updateJobExpenseDto
    });
  }

  async remove(id: string) {
    return (this.prisma as any).jobExpense.delete({
      where: { id }
    });
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateJobExpenseDto } from './create-job-expense.dto';

export class UpdateJobExpenseDto extends PartialType(CreateJobExpenseDto) {}

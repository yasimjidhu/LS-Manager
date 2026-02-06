import { Module } from '@nestjs/common';
import { JobExpensesService } from './job-expenses.service';
import { JobExpensesController } from './job-expenses.controller';

@Module({
  controllers: [JobExpensesController],
  providers: [JobExpensesService],
})
export class JobExpensesModule {}

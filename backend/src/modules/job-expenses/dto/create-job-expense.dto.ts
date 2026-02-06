import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

export class CreateJobExpenseDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(ExpenseCategory)
    @IsNotEmpty()
    category: ExpenseCategory;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    proofUrl?: string; // Optional for now, assuming file upload returns a URL
}

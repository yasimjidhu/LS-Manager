import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsOptional()
    clientName?: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsOptional()
    items?: any[];

    @IsOptional()
    createdBy?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

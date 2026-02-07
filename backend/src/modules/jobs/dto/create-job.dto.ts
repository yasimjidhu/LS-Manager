import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { JobStatus } from '@prisma/client';

export { JobStatus };

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    date: string; // YYYY-MM-DD

    @IsString()
    @IsNotEmpty()
    duration: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsNotEmpty()
    client: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsNumber()
    requiredWorkers?: number;

    @IsOptional()
    includeSelfAsWorker?: boolean;
}

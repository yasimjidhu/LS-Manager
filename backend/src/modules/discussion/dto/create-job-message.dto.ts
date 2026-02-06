import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateJobMessageDto {
    @IsUUID()
    jobId: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

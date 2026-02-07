import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CheckInItemDto {
    @IsNotEmpty()
    @IsUUID()
    jobId: string;

    @IsNotEmpty()
    @IsUUID()
    itemId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsUUID()
    assignedToId?: string;

    @IsOptional()
    qrCode?: string;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CheckoutItemDto {
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
}

import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCheckoutDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsArray()
    @IsNotEmpty()
    items: { itemId: string; quantity: number }[];

    @IsString()
    @IsOptional()
    assignedToId?: string;
}

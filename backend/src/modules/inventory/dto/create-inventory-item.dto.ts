import { IsString, IsNumber, IsEnum, IsOptional, Min, IsUUID } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class CreateInventoryItemDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    qrCode?: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(ItemStatus)
    @IsOptional()
    status?: ItemStatus;

    @IsString()
    categoryId: string;
}

import { IsString, IsNumber, IsEnum, IsOptional, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
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

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsEnum(ItemStatus)
    @IsOptional()
    status?: ItemStatus;

    @IsString()
    categoryId: string;
}

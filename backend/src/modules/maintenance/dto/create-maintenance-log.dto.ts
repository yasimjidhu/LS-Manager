import { IsString, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class CreateMaintenanceLogDto {
    @IsString()
    description: string;

    @IsNumber()
    @IsOptional()
    cost?: number;

    @IsEnum(ItemStatus)
    status: ItemStatus;

    @IsUUID()
    itemId: string;
}

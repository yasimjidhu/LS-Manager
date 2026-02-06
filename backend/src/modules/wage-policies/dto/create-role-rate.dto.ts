import { IsString, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { WageType } from '@prisma/client';

export class CreateRoleRateDto {
    @IsString()
    @IsNotEmpty()
    roleName: string;

    @IsEnum(WageType)
    @IsNotEmpty()
    wageType: WageType;

    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @IsString()
    @IsOptional()
    description?: string;
}

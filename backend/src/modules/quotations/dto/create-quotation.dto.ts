import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsDateString,
    IsArray,
    ValidateNested,
    IsEmail
} from 'class-validator';

export class CreateQuotationItemDto {
    @IsOptional()
    @IsString()
    itemId?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    unitPrice: number;
}

export class CreateQuotationDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    // Client Details
    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsOptional()
    @IsString()
    clientPhone?: string;

    @IsOptional()
    @IsEmail()
    clientEmail?: string;

    // Event Details
    @IsString()
    @IsNotEmpty()
    eventName: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string; // ISO Date string

    @IsString()
    @IsNotEmpty()
    eventLocation: string;

    @IsOptional()
    @IsString()
    eventDescription?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuotationItemDto)
    items?: CreateQuotationItemDto[];

    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @IsOptional()
    @IsNumber()
    discount?: number;

    @IsOptional()
    @IsDateString()
    validUntil?: string; // ISO Date string
}

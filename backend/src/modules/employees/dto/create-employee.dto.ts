import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, IsArray } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsArray()
    @IsOptional()
    skills?: string[];

    @IsEnum(['FIXED', 'PIECE_RATE', 'PERCENTAGE'])
    @IsOptional()
    wageModel?: 'FIXED' | 'PIECE_RATE' | 'PERCENTAGE';

    @IsNumber()
    @IsOptional()
    baseWage?: number;

    // User account fields
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(['ADMIN', 'SUPERVISOR', 'EMPLOYEE'])
    @IsOptional()
    role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
}

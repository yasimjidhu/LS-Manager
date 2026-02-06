import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum Role {
    ADMIN = 'ADMIN',
    SUPERVISOR = 'SUPERVISOR',
    EMPLOYEE = 'EMPLOYEE'
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}

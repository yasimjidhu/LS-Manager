import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        // Force role to EMPLOYEE for public registration to prevent privilege escalation
        // To assign ADMIN/SUPERVISOR roles, an Admin must update the user later
        const safeUserDto = { ...createUserDto, role: Role.EMPLOYEE };
        return this.authService.register(safeUserDto);
    }
}

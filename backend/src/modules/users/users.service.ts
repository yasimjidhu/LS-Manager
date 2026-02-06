import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                employee: true,
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                employee: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data: {
                role: data.role,
                isActive: data.isActive
            }
        });
    }
}

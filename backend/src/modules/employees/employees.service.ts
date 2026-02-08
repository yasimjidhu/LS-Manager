import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(createEmployeeDto: CreateEmployeeDto) {
        const { email, password, role, ...employeeData } = createEmployeeDto;

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and employee in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role || 'EMPLOYEE',
                    isActive: true
                }
            });

            const employee = await tx.employee.create({
                data: {
                    ...employeeData,
                    userId: user.id,
                    skills: employeeData.skills || [],
                    wageModel: employeeData.wageModel || 'FIXED',
                    baseWage: employeeData.baseWage || 0
                },
                include: {
                    user: true
                }
            });

            return employee;
        });

        return result;
    }

    async findAll(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
        const { page = 1, limit = 10, search, role, status } = params || {};
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (role && role !== 'ALL') {
            where.user = { ...where.user, role };
        }

        if (status && status !== 'ALL') {
            where.user = { ...where.user, isActive: status === 'ACTIVE' };
        }

        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            isActive: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: Number(skip),
                take: Number(limit)
            }),
            this.prisma.employee.count({ where })
        ]);

        return {
            data: employees,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                },
                wages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                jobRequests: {
                    where: {
                        status: 'APPROVED'
                    },
                    include: {
                        job: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                assignments: {
                    include: {
                        event: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        return employee;
    }

    async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
        const { email, password, role, isActive, ...employeeData } = updateEmployeeDto;

        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Update in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Update user if user fields provided
            if (employee.userId && (email || password || role !== undefined || isActive !== undefined)) {
                const userUpdateData: any = {};

                if (email) userUpdateData.email = email;
                if (role !== undefined) userUpdateData.role = role;
                if (isActive !== undefined) userUpdateData.isActive = isActive;
                if (password) userUpdateData.password = await bcrypt.hash(password, 10);

                await tx.user.update({
                    where: { id: employee.userId },
                    data: userUpdateData
                });
            }

            // Update employee
            const updatedEmployee = await tx.employee.update({
                where: { id },
                data: employeeData,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            isActive: true
                        }
                    }
                }
            });

            return updatedEmployee;
        });

        return result;
    }

    async remove(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Delete in transaction
        await this.prisma.$transaction(async (tx) => {
            // Delete employee first (due to foreign key)
            await tx.employee.delete({
                where: { id }
            });

            // Delete associated user if exists
            if (employee.userId) {
                await tx.user.delete({
                    where: { id: employee.userId }
                });
            }
        });

        return { message: 'Employee deleted successfully' };
    }

    async getStats() {
        const [total, active, supervisors, blocked] = await Promise.all([
            this.prisma.employee.count(),
            this.prisma.employee.count({ where: { user: { isActive: true } } }),
            this.prisma.employee.count({ where: { user: { role: 'SUPERVISOR' } } }),
            this.prisma.employee.count({ where: { user: { isActive: false } } })
        ]);

        return { total, active, supervisors, blocked };
    }
}

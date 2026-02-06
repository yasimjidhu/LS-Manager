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

    async findAll() {
        return this.prisma.employee.findMany({
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
            }
        });
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
}

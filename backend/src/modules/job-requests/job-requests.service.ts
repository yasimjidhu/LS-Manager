import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

@Injectable()
export class JobRequestsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async create(jobId: string, userId: string) {
        // Find employee record for the user
        const employee = await this.prisma.employee.findUnique({
            where: { userId }
        });
        if (!employee) throw new NotFoundException('Employee profile not found');

        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');

        // Check if request already exists
        const existingRequest = await this.prisma.jobRequest.findUnique({
            where: {
                jobId_employeeId: {
                    jobId,
                    employeeId: employee.id
                }
            }
        });
        if (existingRequest) throw new BadRequestException('Request already exists');

        const request = await this.prisma.jobRequest.create({
            data: {
                jobId,
                employeeId: employee.id,
                status: 'PENDING'
            },
            include: { job: true, employee: true }
        });

        // Notify Admins and Supervisors
        await this.notificationsService.notifyRole(
            [Role.ADMIN, Role.SUPERVISOR],
            'New Job Application',
            `${employee.firstName} ${employee.lastName} requested to join "${job.title}".`,
            'INFO'
        );

        return request;
    }

    async approve(id: string) {
        const request = await this.prisma.jobRequest.findUnique({
            where: { id },
            include: { job: true, employee: true }
        });
        if (!request) throw new NotFoundException('Request not found');

        const updatedRequest = await this.prisma.jobRequest.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        // Assuming approval means assignment logic is handled here or implicitly via approved requests list.
        // If strict assignment model exists, create it here. 
        // For now, we rely on JobRequest status.

        // Notify Employee
        if (request.employee.userId) {
            await this.notificationsService.create(
                request.employee.userId,
                'Job Application Approved',
                `Your request to join "${request.job.title}" has been approved!`,
                'SUCCESS'
            );
        }

        return updatedRequest;
    }

    async reject(id: string, reason: string) {
        if (!reason) throw new BadRequestException('Rejection reason is required');

        const request = await this.prisma.jobRequest.findUnique({
            where: { id },
            include: { job: true, employee: true }
        });
        if (!request) throw new NotFoundException('Request not found');

        const updatedRequest = await this.prisma.jobRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            }
        });

        // Notify Employee
        if (request.employee.userId) {
            await this.notificationsService.create(
                request.employee.userId,
                'Job Application Rejected',
                `Your request to join "${request.job.title}" was rejected: ${reason}`,
                'ERROR'
            );
        }

        return updatedRequest;
    }

    async findAll(jobId?: string, employeeId?: string) {
        const where: any = {};
        if (jobId) where.jobId = jobId;
        if (employeeId) where.employeeId = employeeId;

        return this.prisma.jobRequest.findMany({
            where,
            include: {
                employee: true,
                job: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

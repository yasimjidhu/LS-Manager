import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { WagesService } from '../wages/wages.service';

@Injectable()
export class JobsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private wagesService: WagesService
    ) { }

    async create(createJobDto: CreateJobDto, userId: string) {
        try {
            const { includeSelfAsWorker, ...jobData } = createJobDto;

            const job = await this.prisma.job.create({
                data: jobData,
            });

            // If requested, include the creator as a worker (if they have an employee profile)
            if (includeSelfAsWorker) {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    include: { employee: true }
                });

                if (user?.employee) {
                    await this.prisma.jobRequest.create({
                        data: {
                            jobId: job.id,
                            employeeId: user.employee.id,
                            status: 'PENDING'
                        }
                    });
                }
            }

            // Auto-create Group Chat / Welcome Message
            await this.prisma.jobMessage.create({
                data: {
                    content: `🔔 Group created for ${job.title}. Welcome Supervisor and Team!`,
                    jobId: job.id,
                    userId: userId
                }
            });

            // Notify Admins and Supervisors
            await this.notificationsService.notifyRole(
                ['ADMIN', 'SUPERVISOR'],
                'New Job Scheduled',
                `Job "${job.title}" has been scheduled for ${job.date}.`,
                'INFO' 
                
            );

            return job;
        } catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    }

    async clone(id: string, userId: string) {
        const existingJob = await this.findOne(id);

        // Prepare new job data - only scalar fields
        const newJob = await this.prisma.job.create({
            data: {
                title: `${existingJob.title} (Copy)`,
                date: existingJob.date,
                duration: existingJob.duration,
                location: existingJob.location,
                client: existingJob.client,
                description: existingJob.description,
                status: 'PENDING',
                color: existingJob.color,
                requiredWorkers: existingJob.requiredWorkers,
            }
        });

        // Clone Crew Requests
        if (existingJob.requests && existingJob.requests.length > 0) {
            const requests = existingJob.requests.map(req => ({
                jobId: newJob.id,
                employeeId: req.employeeId,
                status: 'PENDING'
            }));

            await this.prisma.jobRequest.createMany({
                data: requests
            });
        }

        // Clone Gear List (Checkouts) - Optional but often desired during clone
        if (existingJob.checkouts && existingJob.checkouts.length > 0) {
            const checkouts = existingJob.checkouts.map(log => ({
                jobId: newJob.id,
                itemId: log.itemId,
                quantity: log.quantity,
                assignedToId: log.assignedToId,
                status: 'CHECKED_OUT' as const, // Re-record as checked out
                checkedOutAt: new Date(),
            }));

            await this.prisma.checkoutLog.createMany({
                data: checkouts
            });
        }

        // Auto-create Group Chat
        await this.prisma.jobMessage.create({
            data: {
                content: `🔔 Group created for ${newJob.title}. Welcome Supervisor and Team!`,
                jobId: newJob.id,
                userId: userId
            }
        });

        return newJob;
    }

    async findAll(page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                orderBy: [
                    { date: 'asc' },
                ],
                include: {
                    requests: {
                        include: {
                            employee: true
                        }
                    },
                },
                take: Number(limit),
                skip: Number(skip),
            }),
            this.prisma.job.count()
        ]);

        return {
            data: jobs,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: string) {
        const job = await (this.prisma as any).job.findUnique({
            where: { id },
            include: {
                checkouts: { include: { item: true } },
                requests: { include: { employee: true } },
                wages: true,
                invoice: true,
                expenses: { include: { recordedBy: true } }
            },
        });
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
        return job;
    }

    async update(id: string, updateJobDto: UpdateJobDto) {
        const existingJob = await this.findOne(id); // Check if exists

        const updatedJob = await this.prisma.job.update({
            where: { id },
            data: updateJobDto,
        });

        // Notifications logic
        // Notifications logic
        if (updateJobDto.status && updateJobDto.status !== existingJob.status) {
            const isCancelled = updateJobDto.status === 'CANCELLED';
            const isCompleted = updateJobDto.status === 'COMPLETED';

            // Automatic Wage Calculation
            if (isCompleted) {
                await this.wagesService.calculateForJob(id);
            }

            await this.notificationsService.notifyRole(
                isCancelled ? ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'] : ['ADMIN', 'SUPERVISOR'],
                isCancelled ? 'Job Cancelled' : 'Job Status Updated',
                `Job "${updatedJob.title}" has been ${isCancelled ? 'cancelled' : `updated to ${updateJobDto.status}`}.`,
                isCancelled ? 'ERROR' : 'INFO'
            );
        }

        if (updateJobDto.date && updateJobDto.date !== existingJob.date) {
            await this.notificationsService.notifyRole(
                ['ADMIN', 'SUPERVISOR', 'EMPLOYEE'], // Notify everyone of date change
                'Job Rescheduled',
                `Job "${updatedJob.title}" moved to ${updateJobDto.date}.`,
                'WARNING'
            );
        }

        return updatedJob;
    }

    async remove(id: string) {
        await this.findOne(id); // Check if exists
        return this.prisma.job.delete({
            where: { id },
        });
    }
}

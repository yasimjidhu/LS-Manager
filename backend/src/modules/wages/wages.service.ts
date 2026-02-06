import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WageType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WagesService {
    private readonly logger = new Logger(WagesService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async findEmployeeByUserId(userId: string) {
        return this.prisma.employee.findUnique({
            where: { userId }
        });
    }

    async calculateForJob(jobId: string) {
        this.logger.log(`Calculating wages for job ${jobId}`);

        // Fetch global item piece rates for fallback
        const globalItemRates = await this.prisma.itemPieceRate.findMany();

        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                requests: {
                    where: { status: 'APPROVED' },
                    include: {
                        employee: {
                            include: {
                                wageRates: true
                            }
                        }
                    }
                },
                checkouts: {
                    include: {
                        item: true,
                        assignedTo: {
                            include: {
                                wageRates: true
                            }
                        }
                    }
                },
                invoice: true
            }
        }) as any;


        if (!job) {
            this.logger.error(`Job ${jobId} not found`);
            return;
        }

        if (job.status !== 'COMPLETED') {
            this.logger.warn(`Job ${jobId} is not completed. Wages should only be calculated for completed jobs.`);
            return;
        }

        // Merge employees from Approved Requests and Checkout Logs (who worked on items)
        const requestEmployees = job.requests.map(req => req.employee);
        const checkoutEmployees = job.checkouts
            .map(c => c.assignedTo)
            .filter(emp => emp && emp.id); // Ensure valid employee object

        const allEmployeesMap = new Map();
        [...requestEmployees, ...checkoutEmployees].forEach(emp => {
            if (emp && !allEmployeesMap.has(emp.id)) {
                allEmployeesMap.set(emp.id, emp);
            }
        });

        const employees = Array.from(allEmployeesMap.values()) as any[];

        // --- Calculate Total Job Piece Rate Pool (Shared) ---
        let totalJobPieceRatePool = 0;
        let poolBreakdownItems: { reason: string; amount: number; }[] = [];

        // 1. Calculate pool from all job checkouts
        for (const checkout of job.checkouts) {
            let rate = 0;
            const globalRate = globalItemRates.find(r => r.itemId === checkout.itemId);
            if (globalRate) {
                rate = Number(globalRate.ratePerUnit);
            }

            if (rate > 0) {
                const qty = checkout.quantity || 1;
                const total = rate * qty;
                totalJobPieceRatePool += total;
                poolBreakdownItems.push({
                    reason: `${checkout.item.name} (${qty} x ${rate})`,
                    amount: total
                });
            }
        }

        // 2. Count eligible piece rate workers (excluding those with FIXED_JOB_RATE override)
        const pieceRateWorkers = employees.filter(emp => {
            const hasFixedJobRate = emp.wageRates.some(r => r.wageType === 'FIXED_JOB_RATE');
            return !hasFixedJobRate && emp.wageModel === 'PIECE_RATE';
        });

        const sharePerWorker = pieceRateWorkers.length > 0 ? (totalJobPieceRatePool / pieceRateWorkers.length) : 0;
        // ----------------------------------------------------

        for (const employee of employees) {
            let wageAmount = 0;
            let description = `Wage for job: ${job.title}`;
            let breakdown: { reason: string; amount: number; }[] = [];

            // 1. Check for Specific Job Role Wage Rate (FIXED_JOB_RATE)
            const jobRate = employee.wageRates.find(r => r.wageType === 'FIXED_JOB_RATE');


            if (jobRate) {
                wageAmount = Number(jobRate.rate);
                description += ` (Fixed Job Rate)`;
                breakdown.push({ reason: 'Fixed Job Rate', amount: wageAmount });
            }
            // 2. Check Employee's Default Wage Model
            else {
                switch (employee.wageModel) {
                    case 'FIXED': // Fixed Base Wage (e.g., Daily)
                        // For MVP, using baseWage as fixed pay per job
                        wageAmount = Number(employee.baseWage);
                        description += ` (Base Fixed Wage)`;
                        breakdown.push({ reason: 'Base Fixed Wage', amount: wageAmount });
                        break;

                    case 'PERCENTAGE':
                        // Percentage of Invoice Total
                        if (job.invoice) {
                            // Assuming baseWage holds percentage (e.g. 10)
                            const percentage = Number(employee.baseWage);
                            const invoiceTotal = Number(job.invoice.totalAmount);
                            wageAmount = (invoiceTotal * percentage) / 100;
                            description += ` (${percentage}% of Invoice)`;
                            breakdown.push({ reason: `${percentage}% of Invoice Amount (${invoiceTotal})`, amount: wageAmount });
                        } else {
                            this.logger.warn(`Cannot calculate PERCENTAGE wage for employee ${employee.id}: No invoice found for job ${job.id}`);
                        }
                        break;

                    case 'PIECE_RATE':
                        if (sharePerWorker > 0) {
                            wageAmount = sharePerWorker;
                            description += ` (Split Piece Rate - Share of ${pieceRateWorkers.length} workers)`;

                            // Add breakdown of the pool
                            breakdown.push({ reason: `Total Job Pool: ${totalJobPieceRatePool}`, amount: totalJobPieceRatePool });
                            breakdown.push(...poolBreakdownItems);
                            breakdown.push({ reason: `Split among ${pieceRateWorkers.length} workers`, amount: -1 * (totalJobPieceRatePool - wageAmount) }); // Visual representation? No, better just show the share.
                        } else {
                            // Fallback to base wage if global pool is empty (no items with rates used)
                            wageAmount = Number(employee.baseWage || 0);
                            description += ` (Base Wage - No applicable piece rate items found)`;
                            breakdown.push({ reason: 'Base Wage (No piece rate items)', amount: wageAmount });
                        }
                        break;
                }
            }

            // Create Wage Record
            if (wageAmount > 0) {
                // Check if wage already exists to avoid duplicates
                const existingWage = await this.prisma.wage.findFirst({
                    where: {
                        employeeId: employee.id,
                        jobId: job.id
                    }
                });

                if (existingWage) {
                    await this.prisma.wage.update({
                        where: { id: existingWage.id },
                        data: {
                            amount: wageAmount,
                            description: description,
                            breakdown: JSON.stringify(breakdown)
                        }
                    });
                    this.logger.log(`Updated wage for employee ${employee.id}: ${wageAmount}`);
                } else {
                    await this.prisma.wage.create({
                        data: {
                            employeeId: employee.id,
                            jobId: job.id,
                            amount: wageAmount,
                            description: description,
                            breakdown: JSON.stringify(breakdown),
                            isPaid: false
                        }
                    });
                    this.logger.log(`Created wage for employee ${employee.id}: ${wageAmount}`);
                }
            }
        }

        await this.notificationsService.notifyRole(
            ['ADMIN'],
            'Wages Calculated',
            `Wages for ${employees.length} employees have been calculated for job "${job.title}".`,
            'SUCCESS'
        );
    }

    async updateWage(id: string, data: { amount?: number; description?: string }) {
        return this.prisma.wage.update({
            where: { id },
            data
        });
    }

    async updateWageStatus(id: string, status: string) {
        return this.prisma.wage.update({
            where: { id },
            data: { status: status as any }
        });
    }


    async recalculateAll() {
        const jobs = await this.prisma.job.findMany({
            where: { status: 'COMPLETED' },
            select: { id: true }
        });

        this.logger.log(`Recalculating wages for ${jobs.length} jobs...`);
        for (const job of jobs) {
            await this.calculateForJob(job.id);
        }
        return { message: `Recalculated wages for ${jobs.length} jobs` };
    }

    async findAll(filters: { employeeId?: string; month?: string; status?: 'PAID' | 'UNPAID' }) {
        console.log('inside getall wages', filters)
        const where: any = {};

        if (filters.employeeId) {
            where.employeeId = filters.employeeId;
        }

        if (filters.status) {
            where.isPaid = filters.status === 'PAID';
        }

        if (filters.month) {
            const date = new Date(filters.month + '-01'); // YYYY-MM
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            where.createdAt = {
                gte: startOfMonth,
                lte: endOfMonth
            };
        }

        return this.prisma.wage.findMany({
            where,
            include: {
                employee: true,
                job: {
                    select: {
                        id: true,
                        title: true,
                        date: true
                    }
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getStats() {
        const totalWages = await this.prisma.wage.aggregate({
            _sum: { amount: true }
        });

        const paidWages = await this.prisma.wage.aggregate({
            where: { isPaid: true },
            _sum: { amount: true }
        });

        const pendingWages = await this.prisma.wage.aggregate({
            where: { isPaid: false },
            _sum: { amount: true }
        });

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        const thisMonthWages = await this.prisma.wage.aggregate({
            where: {
                createdAt: { gte: startOfMonth }
            },
            _sum: { amount: true }
        });

        return {
            totalPaid: Number(paidWages._sum.amount || 0),
            totalPending: Number(pendingWages._sum.amount || 0),
            thisMonth: Number(thisMonthWages._sum.amount || 0)
        };
    }

    async getStatsForEmployee(employeeId: string) {
        const paidWages = await this.prisma.wage.aggregate({
            where: { employeeId, isPaid: true },
            _sum: { amount: true }
        });

        const pendingWages = await this.prisma.wage.aggregate({
            where: { employeeId, isPaid: false },
            _sum: { amount: true }
        });

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        const thisMonthWages = await this.prisma.wage.aggregate({
            where: {
                employeeId,
                createdAt: { gte: startOfMonth }
            },
            _sum: { amount: true }
        });

        return {
            totalPaid: Number(paidWages._sum.amount || 0),
            totalPending: Number(pendingWages._sum.amount || 0),
            thisMonth: Number(thisMonthWages._sum.amount || 0)
        };
    }

    async markAsPaid(id: string) {
        return this.prisma.wage.update({
            where: { id },
            data: {
                isPaid: true,
                paidAt: new Date()
            }
        });
    }

}

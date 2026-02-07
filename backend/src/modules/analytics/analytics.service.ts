import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getAdminAnalytics(dateRange: string) {
        try {
            const { startDate, endDate } = this.parseDateRange(dateRange);

            // Revenue Analytics
            const invoices = await this.prisma.invoice.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
            const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
            const pendingAmount = totalRevenue - totalPaid;

            // Job Analytics
            const jobs = await this.prisma.job.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            const jobsByStatus = {
                PENDING: jobs.filter(j => j.status === 'PENDING').length,
                PLANNED: jobs.filter(j => j.status === 'PLANNED').length,
                ONGOING: jobs.filter(j => j.status === 'ONGOING').length,
                COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length,
                CANCELLED: jobs.filter(j => j.status === 'CANCELLED').length,
            };

            // Employee Analytics - using type assertion for Prisma client
            const jobRequests = await (this.prisma as any).jobRequest.findMany({
                where: {
                    status: 'APPROVED',
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    employeeId: true,
                },
                distinct: ['employeeId'],
            });

            const activeEmployees = jobRequests.length;

            // Monthly Revenue Trend (last 6 months)
            // Monthly Revenue Trend (last 6 months)
            const revenueTrend = await this.getMonthlyRevenueTrend();

            // Recent Jobs for Admin Table
            const recentJobs = await this.prisma.job.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            });

            // Calculate Total Expenses (Labor + Transport + JobExpenses)
            const jobExpenses = await (this.prisma as any).jobExpense.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            const totalJobExpenses = jobExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

            // Fetch total wages (as labor cost)
            const totalWages = await this.prisma.wage.aggregate({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: { amount: true }
            });

            const totalLaborCost = Number(totalWages._sum.amount || 0);

            // Fetch other costs from invoices (e.g. transport)
            const totalInvoicedCosts = invoices.reduce((sum, inv) =>
                sum + Number(inv.transportCost || 0) + Number(inv.taxAmount || 0), 0);

            const totalExpenses = totalLaborCost + totalJobExpenses + totalInvoicedCosts;
            const netProfit = totalRevenue - totalExpenses;

            return {
                summary: {
                    totalRevenue,
                    totalPaid,
                    pendingAmount,
                    totalExpenses,
                    netProfit,
                    jobsCompleted: jobsByStatus.COMPLETED,
                    activeJobs: jobsByStatus.ONGOING + jobsByStatus.PLANNED,
                    activeEmployees,
                    totalInvoices: invoices.length,
                },
                jobsByStatus,
                revenueTrend,
                recentJobs,
                topEmployees: await this.getTopEmployees(startDate, endDate),
            };
        } catch (error) {
            console.error('Error in getAdminAnalytics:', error);
            throw error;
        }
    }

    async getSupervisorAnalytics(dateRange: string) {
        const { startDate, endDate } = this.parseDateRange(dateRange);

        // Jobs managed
        const jobs = await this.prisma.job.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const jobsByStatus = {
            PENDING: jobs.filter(j => j.status === 'PENDING').length,
            PLANNED: jobs.filter(j => j.status === 'PLANNED').length,
            ONGOING: jobs.filter(j => j.status === 'ONGOING').length,
            COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length,
        };

        // Team performance - query JobRequest directly
        const jobIds = jobs.map(j => j.id);
        const allRequests = await (this.prisma as any).jobRequest.findMany({
            where: {
                jobId: { in: jobIds },
            },
        });

        const approvedRequests = allRequests.filter(r => r.status === 'APPROVED');
        const pendingRequests = allRequests.filter(r => r.status === 'PENDING');

        // Get crew counts for each job
        const jobCrewCounts = new Map<string, number>();
        allRequests.forEach(req => {
            if (req.status === 'APPROVED') {
                jobCrewCounts.set(req.jobId, (jobCrewCounts.get(req.jobId) || 0) + 1);
            }
        });

        return {
            summary: {
                totalJobs: jobs.length,
                completedJobs: jobsByStatus.COMPLETED,
                activeJobs: jobsByStatus.ONGOING + jobsByStatus.PLANNED,
                teamSize: approvedRequests.length,
                pendingRequests: pendingRequests.length,
            },
            jobsByStatus,
            recentJobs: jobs.slice(0, 10).map(j => ({
                id: j.id,
                title: j.title,
                status: j.status,
                date: j.date,
                location: j.location,
                crewCount: jobCrewCounts.get(j.id) || 0,
                requiredWorkers: j.requiredWorkers,
            })),
        };
    }

    async findEmployeeByUserId(userId: string) {
        return this.prisma.employee.findUnique({
            where: { userId }
        });
    }

    async getEmployeeAnalytics(employeeId: string, dateRange: string) {
        const { startDate, endDate } = this.parseDateRange(dateRange);

        // Find employee's job requests
        const jobRequests = await (this.prisma as any).jobRequest.findMany({
            where: {
                employeeId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                job: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const approvedJobs = jobRequests.filter(r => r.status === 'APPROVED');
        const completedJobs = approvedJobs.filter(r => r.job.status === 'COMPLETED');
        const upcomingJobs = approvedJobs
            .filter(r => r.job.status === 'PLANNED' || r.job.status === 'ONGOING')
            .sort((a, b) => new Date(a.job.date).getTime() - new Date(b.job.date).getTime());

        // Fetch earnings summary from Wage table
        const wages = await this.prisma.wage.aggregate({
            where: {
                employeeId,
                createdAt: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
        });

        const pendingWages = await this.prisma.wage.aggregate({
            where: {
                employeeId,
                isPaid: false
            },
            _sum: { amount: true }
        });

        // Attendance stats
        const attendance = await this.prisma.attendance.count({
            where: {
                employeeId,
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // Fetch available jobs (opportunities)
        const availableJobs = await this.prisma.job.findMany({
            where: {
                status: { in: ['PENDING', 'PLANNED'] },
                date: { gte: new Date().toISOString().split('T')[0] },
                requests: {
                    none: {
                        employeeId: employeeId
                    }
                }
            },
            orderBy: { date: 'asc' },
            take: 3
        });

        return {
            summary: {
                totalApplications: jobRequests.length,
                approvedJobs: approvedJobs.length,
                completedJobs: completedJobs.length,
                upcomingJobs: upcomingJobs.length,
                totalEarnings: Number(wages._sum.amount || 0),
                unpaidBalance: Number(pendingWages._sum.amount || 0),
                totalAttendance: attendance,
                pendingApplications: jobRequests.filter(r => r.status === 'PENDING').length,
            },
            recentActivity: jobRequests.slice(0, 10).map(r => ({
                jobTitle: r.job.title,
                status: r.status,
                jobStatus: r.job.status,
                date: r.job.date,
                location: r.job.location,
                appliedAt: r.createdAt,
            })),
            upcomingSchedule: upcomingJobs.slice(0, 5).map(r => ({
                id: r.job.id,
                title: r.job.title,
                date: r.job.date,
                time: r.job.time || 'TBD',
                location: r.job.location,
                status: r.job.status
            })),
            availableJobs: availableJobs.map(j => ({
                id: j.id,
                title: j.title,
                location: j.location,
                date: j.date,
                status: j.status
            }))
        };
    }

    private async getMonthlyRevenueTrend() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [invoices, wages, jobExpenses] = await Promise.all([
            this.prisma.invoice.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
            }),
            this.prisma.wage.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
            }),
            (this.prisma as any).jobExpense.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
            }),
        ]);

        // Group by month
        const monthlyData = new Map<string, { month: string; revenue: number; expenses: number; profit: number; timestamp: number }>();

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData.set(key, {
                month: monthLabel,
                revenue: 0,
                expenses: 0,
                profit: 0,
                timestamp: date.getTime()
            });
        }

        invoices.forEach(inv => {
            const d = new Date(inv.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const existing = monthlyData.get(key);
            if (existing) {
                existing.revenue += Number(inv.totalAmount);
                existing.expenses += Number(inv.transportCost || 0);
            }
        });

        wages.forEach(w => {
            const d = new Date(w.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const existing = monthlyData.get(key);
            if (existing) {
                existing.expenses += Number(w.amount);
            }
        });

        jobExpenses.forEach(exp => {
            const d = new Date(exp.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const existing = monthlyData.get(key);
            if (existing) {
                existing.expenses += Number(exp.amount);
            }
        });

        // Calculate profit for each month
        monthlyData.forEach(data => {
            data.profit = data.revenue - data.expenses;
        });

        return Array.from(monthlyData.values())
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(({ month, revenue, expenses, profit }) => ({
                month,
                revenue,
                expenses,
                profit
            }));
    }

    private async getTopEmployees(startDate: Date, endDate: Date) {
        // Get all wages in the date range
        const wages = await this.prisma.wage.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                // status: { in: ['APPROVED', 'PAID'] } // Optional: only count approved wages
            },
            include: {
                employee: {
                    include: { user: true }
                },
                job: true,
            },
        });

        // Group by employee
        const employeeStats = new Map<string, {
            employeeId: string;
            firstName: string;
            lastName: string;
            role: string;
            jobs: number;
            completedJobs: number;
            totalEarnings: number;
        }>();

        wages.forEach(wage => {
            const empId = wage.employeeId;
            const role = wage.employee.user?.role || 'EMPLOYEE';

            const existing = employeeStats.get(empId) || {
                employeeId: empId,
                firstName: wage.employee.firstName,
                lastName: wage.employee.lastName,
                role: role,
                jobs: 0,
                completedJobs: 0,
                totalEarnings: 0
            };

            // Count unique jobs
            if (wage.jobId) {
                existing.jobs += 1; // This might overcount if multiple wages per job, but usually 1 wage per job/worker
                if (wage.job?.status === 'COMPLETED') {
                    existing.completedJobs += 1;
                }
            }

            existing.totalEarnings += Number(wage.amount);
            employeeStats.set(empId, existing);
        });

        return Array.from(employeeStats.values())
            .filter(e => e.totalEarnings > 0 || e.jobs > 0)
            .sort((a, b) => b.totalEarnings - a.totalEarnings) // Sort by earnings instead of job count
            .slice(0, 10);
    }

    private parseDateRange(dateRange: string): { startDate: Date; endDate: Date } {
        const endDate = new Date();
        let startDate = new Date();

        switch (dateRange) {
            case 'this-week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'this-month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'last-month':
                startDate.setMonth(endDate.getMonth() - 2);
                endDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'this-quarter':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'this-year':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(endDate.getMonth() - 1);
        }

        return { startDate, endDate };
    }
}

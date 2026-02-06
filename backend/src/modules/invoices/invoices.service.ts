import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

@Injectable()
export class InvoicesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto) {
        const { jobId, clientName, dueDate, items, createdBy, status } = createInvoiceDto;

        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');

        // Calculate totals
        let subtotal = 0;
        // Basic calculation based on passed items
        const invoiceItemsData = (items || []).map(item => {
            const lineTotal = Number(item.quantity) * Number(item.unitPrice);
            subtotal += lineTotal;
            return {
                itemId: item.itemId || undefined,
                description: item.description || item.itemName || 'Item',
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                totalPrice: lineTotal
            };
        });

        // Create Invoice
        const invoice = await this.prisma.invoice.create({
            data: {
                clientName: clientName || job.client,
                jobId: jobId,
                dueDate: new Date(dueDate),
                status: (status || 'DRAFT') as any,
                subtotal: subtotal,
                totalAmount: subtotal,
                createdBy,
                items: {
                    create: invoiceItemsData
                }
            },
            include: { job: true, items: true }
        });

        // Notify Admins
        if (invoice.status !== 'DRAFT') {
            await this.notificationsService.notifyRole(
                [Role.ADMIN, Role.SUPERVISOR],
                'New Invoice Created',
                `Invoice #${invoice.itemOrder} for ${invoice.clientName} created with amount ₹${invoice.totalAmount}.`,
                'INFO'
            );
        }

        return invoice;
    }

    async update(id: string, data: any) {
        const existingInvoice = await this.findOne(id);
        const { items, ...rest } = data;
        let updateData: any = { ...rest };

        if (items) {
            let subtotal = 0;
            const invoiceItemsData = items.map((item: any) => {
                const lineTotal = Number(item.quantity) * Number(item.unitPrice);
                subtotal += lineTotal;
                return {
                    itemId: item.itemId || undefined,
                    description: item.description || item.itemName || 'Item',
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    totalPrice: lineTotal
                };
            });

            updateData.items = {
                deleteMany: {},
                create: invoiceItemsData
            };
            updateData.subtotal = subtotal;
            updateData.totalAmount = subtotal;
        }

        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: updateData,
            include: { items: true, job: true }
        });

        if (updateData.status && updateData.status !== existingInvoice.status) {
            await this.notificationsService.notifyRole(
                [Role.ADMIN],
                'Invoice Status Updated',
                `Invoice #${updatedInvoice.itemOrder} status changed to ${updatedInvoice.status}.`,
                updatedInvoice.status === 'PAID' ? 'SUCCESS' : 'INFO'
            );
        }

        return updatedInvoice;
    }

    async approve(id: string, adminId: string) {
        const invoice = await this.prisma.invoice.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: adminId
            }
        });

        await this.notificationsService.notifyRole(
            [Role.SUPERVISOR, Role.ADMIN],
            'Invoice Approved',
            `Invoice #${invoice.itemOrder} has been approved. Ready to send.`,
            'SUCCESS'
        );

        return invoice;
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                include: {
                    job: true,
                    items: true
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(skip),
            }),
            this.prisma.invoice.count()
        ]);

        return {
            data: invoices,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { items: { include: { item: true } }, job: true }
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }
}

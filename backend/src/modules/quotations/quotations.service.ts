import {
    Injectable,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

@Injectable()
export class QuotationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async create(createQuotationDto: CreateQuotationDto) {
        console.log('quotation create body', createQuotationDto)
        try {
            const {
                eventName,
                eventDate,
                eventLocation,
                eventDescription,
                clientName,
                clientPhone,
                clientEmail,
                items,
                taxRate,
                discount,
                validUntil
            } = createQuotationDto;

            // 1. Create Event
            const event = await this.prisma.event.create({
                data: {
                    name: eventName,
                    startDate: new Date(eventDate),
                    endDate: new Date(eventDate),
                    location: eventLocation,
                    description: eventDescription || '',
                    status: 'PLANNED'
                }
            });

            // 2. Process Items
            let subtotal = 0;
            const quotationItemsData: any[] = [];

            if (items?.length) {
                for (const item of items) {
                    let itemId = item.itemId;

                    if (!itemId && item.description) {
                        const newItem = await this.prisma.inventoryItem.create({
                            data: {
                                name: item.description,
                                description: 'Created via Quotation',
                                quantity: 0,
                                price: item.unitPrice,
                                status: 'AVAILABLE',
                                category: {
                                    connectOrCreate: {
                                        where: { name: 'Services' },
                                        create: {
                                            name: 'Services',
                                            description: 'Ad-hoc services'
                                        }
                                    }
                                },
                                qrCode: `ADHOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                            }
                        });
                        itemId = newItem.id;
                    }

                    if (itemId) {
                        const lineTotal =
                            Number(item.quantity) * Number(item.unitPrice);
                        subtotal += lineTotal;

                        quotationItemsData.push({
                            itemId,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            totalPrice: lineTotal
                        });
                    }
                }
            }

            // 3. Totals
            const discountAmount = Number(discount || 0);
            const taxAmount =
                (subtotal - discountAmount) * (Number(taxRate || 0) / 100);
            const totalAmount = subtotal - discountAmount + taxAmount;

            // 4. Create Quotation
            const quotation = await this.prisma.quotation.create({
                data: {
                    eventId: event.id,
                    clientName,
                    clientPhone,
                    clientEmail,
                    subtotal,
                    taxRate: Number(taxRate || 0),
                    taxAmount,
                    discount: discountAmount,
                    totalAmount,
                    validUntil: validUntil ? new Date(validUntil) : null,
                    items: {
                        create: quotationItemsData
                    }
                },
                include: {
                    event: true,
                    items: {
                        include: { item: true }
                    }
                }
            });

            await this.notificationsService.notifyRole(
                [Role.ADMIN, Role.SUPERVISOR],
                'New Quotation Drafted',
                `Quotation for ${quotation.clientName} has been created.`,
                'INFO'
            );

            return quotation;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to create quotation'
            );
        }
    }

    async findAll() {
        try {
            return await this.prisma.quotation.findMany({
                include: {
                    event: true,
                    items: {
                        include: { item: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to fetch quotations'
            );
        }
    }

    async findOne(id: string) {
        try {
            const quotation = await this.prisma.quotation.findUnique({
                where: { id },
                include: {
                    event: true,
                    items: {
                        include: { item: true }
                    }
                }
            });

            if (!quotation) {
                throw new NotFoundException('Quotation not found');
            }

            return quotation;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(
                'Failed to fetch quotation'
            );
        }
    }

    async updateStatus(id: string, status: any) {
        try {
            const quotation = await this.prisma.quotation.update({
                where: { id },
                data: { status },
                include: {
                    event: true,
                    items: {
                        include: { item: true }
                    }
                }
            });

            let notificationType = 'INFO';
            if (status === 'ACCEPTED') notificationType = 'SUCCESS';
            if (status === 'REJECTED') notificationType = 'ERROR';

            await this.notificationsService.notifyRole(
                [Role.ADMIN, Role.SUPERVISOR],
                `Quotation ${status}`,
                `Quotation for ${quotation.clientName} is now ${status}.`,
                notificationType
            );

            return quotation;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to update quotation status'
            );
        }
    }
}

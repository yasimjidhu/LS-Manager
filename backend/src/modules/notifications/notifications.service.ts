import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, title: string, message: string, type: string = 'INFO') {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
        });
    }

    async notifyRole(roles: Role[], title: string, message: string, type: string = 'INFO') {
        const users = await this.prisma.user.findMany({
            where: {
                role: {
                    in: roles
                }
            },
        });

        if (users.length === 0) return { count: 0 };

        const notifications = users.map(user => ({
            userId: user.id,
            title,
            message,
            type,
        }));

        return this.prisma.notification.createMany({
            data: notifications,
        });
    }

    async notifyAdmins(title: string, message: string, type: string = 'INFO') {
        return this.notifyRole([Role.ADMIN], title, message, type);
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}

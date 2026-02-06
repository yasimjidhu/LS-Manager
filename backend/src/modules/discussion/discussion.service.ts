import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobMessageDto } from './dto/create-job-message.dto';
import { DiscussionGateway } from './discussion.gateway';

@Injectable()
export class DiscussionService {
    constructor(
        private prisma: PrismaService,
        private gateway: DiscussionGateway
    ) { }

    async create(createJobMessageDto: CreateJobMessageDto, userId: string) {
        try {
            const message = await this.prisma.jobMessage.create({
                data: {
                    content: createJobMessageDto.content,
                    imageUrl: createJobMessageDto.imageUrl,
                    job: {
                        connect: { id: createJobMessageDto.jobId }
                    },
                    user: {
                        connect: { id: userId }
                    }
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                        }
                    }
                }
            });

            this.gateway.broadcastMessage(createJobMessageDto.jobId, message);
            return message;
        } catch (error) {
            console.error('Error creating job message:', error);
            throw error;
        }
    }

    async findAllByJob(jobId: string) {
        return this.prisma.jobMessage.findMany({
            where: { jobId },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    async remove(id: string, userId: string) {
        // We need the jobId to broadcast the delete
        const message = await this.prisma.jobMessage.findUnique({
            where: { id },
            select: { jobId: true, userId: true }
        });

        if (!message || message.userId !== userId) return null;

        await this.prisma.jobMessage.delete({
            where: { id }
        });

        this.gateway.broadcastDelete(message.jobId, id);
        return { id };
    }
}

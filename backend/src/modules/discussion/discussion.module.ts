import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionController } from './discussion.controller';
import { PrismaService } from '../../database/prisma.service';
import { DiscussionGateway } from './discussion.gateway';

@Module({
    controllers: [DiscussionController],
    providers: [DiscussionService, PrismaService, DiscussionGateway],
    exports: [DiscussionService]
})
export class DiscussionModule { }

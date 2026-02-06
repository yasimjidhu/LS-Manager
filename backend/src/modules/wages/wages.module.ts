import { Module } from '@nestjs/common';
import { WagesService } from './wages.service';
import { WagesController } from './wages.controller';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [WagesController],
    providers: [WagesService, PrismaService],
    exports: [WagesService],
})
export class WagesModule { }

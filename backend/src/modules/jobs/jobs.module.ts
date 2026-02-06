import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { WagesModule } from '../wages/wages.module';

@Module({
    imports: [NotificationsModule, WagesModule],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService]
})
export class JobsModule { }

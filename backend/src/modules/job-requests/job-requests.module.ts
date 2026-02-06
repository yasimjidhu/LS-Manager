import { Module } from '@nestjs/common';
import { JobRequestsService } from './job-requests.service';
import { JobRequestsController } from './job-requests.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [JobRequestsController],
    providers: [JobRequestsService],
})
export class JobRequestsModule { }

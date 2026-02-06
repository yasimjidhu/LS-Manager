import { Controller, Get, Patch, Param, Post, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req) {
        return this.notificationsService.findAll(req.user.userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('read-all')
    markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }
}

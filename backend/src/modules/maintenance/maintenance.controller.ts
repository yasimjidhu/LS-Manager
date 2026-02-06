import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    create(@Body() createMaintenanceLogDto: CreateMaintenanceLogDto) {
        // TODO: Extract userId from request (AuthGuard needed)
        const userId = undefined;
        // @ts-ignore
        return this.maintenanceService.create(createMaintenanceLogDto, userId);
    }

    @Get('item/:itemId')
    findAllByItem(@Param('itemId') itemId: string) {
        return this.maintenanceService.findAllByItem(itemId);
    }

    @Get()
    findAll() {
        return this.maintenanceService.findAll();
    }
}

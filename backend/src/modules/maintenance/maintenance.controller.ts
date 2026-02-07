import { Controller, Get, Post, Body, Param, Req, UseGuards, Patch, Delete } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    create(@Body() createMaintenanceLogDto: CreateMaintenanceLogDto, @Req() req: any) {
        return this.maintenanceService.create(createMaintenanceLogDto, req.user.userId);
    }

    @Get('item/:itemId')
    findAllByItem(@Param('itemId') itemId: string) {
        return this.maintenanceService.findAllByItem(itemId);
    }

    @Get()
    findAll() {
        return this.maintenanceService.findAll();
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    update(@Param('id') id: string, @Body() data: Partial<CreateMaintenanceLogDto>) {
        return this.maintenanceService.update(id, data);
    }

    @Patch(':id/resolve')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    resolve(@Param('id') id: string) {
        return this.maintenanceService.resolve(id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.maintenanceService.remove(id);
    }
}

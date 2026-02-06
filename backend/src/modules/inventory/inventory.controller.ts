import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ItemStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
        return this.inventoryService.create(createInventoryItemDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    findAll(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('status') status?: ItemStatus,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.inventoryService.findAll({ search, categoryId, status, page, limit });
    }

    @Get('categories')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    getCategories() {
        return this.inventoryService.getCategories();
    }

    @Get('conflicts')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    getConflicts() {
        return this.inventoryService.getConflicts();
    }

    @Post('categories')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.inventoryService.createCategory(createCategoryDto);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
        return this.inventoryService.update(id, updateInventoryItemDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    remove(@Param('id') id: string) {
        return this.inventoryService.remove(id);
    }
}

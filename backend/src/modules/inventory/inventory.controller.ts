import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

import { CreateCategoryDto } from './dto/create-category.dto';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { CheckInItemDto } from './dto/checkin-item.dto';
import { ItemStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from '@nestjs/common';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('checkout')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    checkout(@Body() checkoutItemDto: CheckoutItemDto, @Request() req) {
        return this.inventoryService.checkout(checkoutItemDto, req.user.userId);
    }

    @Post('checkin')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    checkIn(@Body() checkInItemDto: CheckInItemDto) {
        return this.inventoryService.checkIn(checkInItemDto);
    }

    @Post()
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/inventory',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    create(@Body() createInventoryItemDto: CreateInventoryItemDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createInventoryItemDto.imageUrl = `/uploads/inventory/${file.filename}`;
        }
        if (createInventoryItemDto.quantity && typeof createInventoryItemDto.quantity === 'string') createInventoryItemDto.quantity = Number(createInventoryItemDto.quantity);
        if (createInventoryItemDto.price && typeof createInventoryItemDto.price === 'string') createInventoryItemDto.price = Number(createInventoryItemDto.price);

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
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/inventory',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            updateInventoryItemDto.imageUrl = `/uploads/inventory/${file.filename}`;
        }
        if (updateInventoryItemDto.quantity && typeof updateInventoryItemDto.quantity === 'string') updateInventoryItemDto.quantity = Number(updateInventoryItemDto.quantity);
        if (updateInventoryItemDto.price && typeof updateInventoryItemDto.price === 'string') updateInventoryItemDto.price = Number(updateInventoryItemDto.price);

        return this.inventoryService.update(id, updateInventoryItemDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SUPERVISOR)
    remove(@Param('id') id: string) {
        return this.inventoryService.remove(id);
    }
}

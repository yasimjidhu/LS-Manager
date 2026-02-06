import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@Controller('quotations')
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService) { }

    @Post()
    create(@Body() createQuotationDto: CreateQuotationDto) {
        return this.quotationsService.create(createQuotationDto);
    }

    @Get()
    findAll() {
        return this.quotationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quotationsService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.quotationsService.updateStatus(id, status);
    }
}

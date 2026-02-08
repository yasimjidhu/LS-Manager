import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    async create(@Body() createInvoiceDto: CreateInvoiceDto) {
        try {
            console.log('📝 Received invoice creation request:', JSON.stringify(createInvoiceDto, null, 2));
            const result = await this.invoicesService.create(createInvoiceDto);
            console.log('✅ Invoice created successfully:', result.id);
            return result;
        } catch (error) {
            console.error('❌ Error creating invoice:', error);
            throw error;
        }
    }

    @Get('stats')
    getStats() {
        return this.invoicesService.getStats();
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string
    ) {
        return this.invoicesService.findAll(page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
        return this.invoicesService.update(id, updateInvoiceDto);
    }
}

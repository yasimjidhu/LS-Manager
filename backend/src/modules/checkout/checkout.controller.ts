import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    create(@Body() createCheckoutDto: CreateCheckoutDto) {
        return this.checkoutService.checkout(createCheckoutDto);
    }

    @Get('history')
    @Roles(Role.ADMIN, Role.SUPERVISOR, Role.EMPLOYEE)
    getHistory() {
        return this.checkoutService.getHistory();
    }
}

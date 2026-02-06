
import { Controller, Get, Patch, Post, Body, Delete, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('company')
    getCompanyProfile() {
        return this.settingsService.getCompanyProfile();
    }

    @Patch('company')
    updateCompanyProfile(@Body() data: any) {
        return this.settingsService.updateCompanyProfile(data);
    }

    @Get('payment')
    getPaymentProfile() {
        return this.settingsService.getPaymentProfile();
    }

    @Patch('payment')
    updatePaymentProfile(@Body() data: any) {
        return this.settingsService.updatePaymentProfile(data);
    }

    @Get('system')
    getSystemSettings() {
        return this.settingsService.getSystemSettings();
    }

    @Patch('system')
    updateSystemSettings(@Body() data: any) {
        return this.settingsService.updateSystemSettings(data);
    }

    @Get('wages/policies')
    getWagePolicies() {
        return this.settingsService.getWagePolicies();
    }

    @Patch('wages/policies/:id')
    updateWagePolicy(@Param('id') id: string, @Body() data: any) {
        return this.settingsService.updateWagePolicy(id, data);
    }

    @Get('wages/rates')
    getWageRates() {
        return this.settingsService.getWageRates();
    }

    @Post('wages/rates')
    createWageRate(@Body() data: any) {
        return this.settingsService.createWageRate(data);
    }

    @Delete('wages/rates/:id')
    deleteWageRate(@Param('id') id: string) {
        return this.settingsService.deleteWageRate(id);
    }
}

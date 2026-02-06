
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getCompanyProfile() {
        return this.prisma.companyProfile.findFirst();
    }

    async updateCompanyProfile(data: any) {
        console.log('Updating Company Profile with data:', JSON.stringify(data, null, 2));
        try {
            const { id, createdAt, updatedAt, ...updateData } = data;
            const profile = await this.prisma.companyProfile.findFirst();

            if (profile) {
                console.log('Found existing profile:', profile.id);
                const result = await this.prisma.companyProfile.update({
                    where: { id: profile.id },
                    data: updateData,
                });
                console.log('Update successful:', result);
                return result;
            }
            console.log('Creating new profile');
            const result = await this.prisma.companyProfile.create({ data: updateData });
            console.log('Creation successful:', result);
            return result;
        } catch (error) {
            console.error('Error updating company profile:', error);
            throw error;
        }
    }

    async getPaymentProfile() {
        const profile = await this.prisma.companyProfile.findFirst({
            include: { paymentProfile: true },
        });
        return profile?.paymentProfile || null;
    }

    async updatePaymentProfile(data: any) {
        const profile = await this.prisma.companyProfile.findFirst({
            include: { paymentProfile: true },
        });

        if (!profile) {
            // Must have company profile first. Create default.
            const newProfile = await this.prisma.companyProfile.create({
                data: { companyName: 'My Company' },
            });
            return this.prisma.paymentProfile.create({
                data: { ...data, companyId: newProfile.id },
            });
        }

        if (profile.paymentProfile) {
            return this.prisma.paymentProfile.update({
                where: { id: profile.paymentProfile.id },
                data,
            });
        }

        return this.prisma.paymentProfile.create({
            data: { ...data, companyId: profile.id },
        });
    }

    async getSystemSettings() {
        const settings = await this.prisma.systemSettings.findFirst({
            include: { company: true }
        });
        return settings;
    }

    async updateSystemSettings(data: any) {
        const { id, createdAt, updatedAt, companyId, company, ...updateData } = data;
        const profile = await this.prisma.companyProfile.findFirst({
            include: { systemSettings: true }
        });

        if (!profile) {
            // Must have company profile first. Create default.
            const newProfile = await this.prisma.companyProfile.create({
                data: { companyName: 'My Company' },
            });
            return this.prisma.systemSettings.create({
                data: { ...updateData, companyId: newProfile.id }
            });
        }

        if (profile.systemSettings) {
            return this.prisma.systemSettings.update({
                where: { id: profile.systemSettings.id },
                data: updateData
            });
        }

        return this.prisma.systemSettings.create({
            data: { ...updateData, companyId: profile.id }
        });
    }

    // Wage Policies - handled here or in WageService?
    // The frontend calls /settings/wages/policies. I'll handle it here for simpler routing or delegate.
    // Actually, let's keep Wage logic separated if possible, but route matches settings.
    // I'll put wage settings logic here for simplicity of "Settings" feature context.

    async getWagePolicies() {
        return this.prisma.wagePolicy.findMany();
    }

    async updateWagePolicy(id: string, data: any) {
        return this.prisma.wagePolicy.update({
            where: { id },
            data,
        });
    }

    async getWageRates() {
        return this.prisma.employeeWageRate.findMany({
            include: { employee: true, item: true },
        });
    }

    async createWageRate(data: any) {
        return this.prisma.employeeWageRate.create({ data });
    }

    async deleteWageRate(id: string) {
        return this.prisma.employeeWageRate.delete({ where: { id } });
    }
}

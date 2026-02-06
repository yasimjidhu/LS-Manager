import { Module } from '@nestjs/common';
import { WagePoliciesController } from './wage-policies.controller';
import { WagePoliciesService } from './wage-policies.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [WagePoliciesController],
    providers: [WagePoliciesService, PrismaService],
})
export class WagePoliciesModule { }

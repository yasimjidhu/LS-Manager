import { Module } from '@nestjs/common';
import { WagesController } from './wages.controller';

@Module({
  controllers: [WagesController]
})
export class WagesModule {}

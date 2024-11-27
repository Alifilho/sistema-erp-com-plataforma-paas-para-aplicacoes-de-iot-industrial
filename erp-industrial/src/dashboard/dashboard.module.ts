import { Module } from '@nestjs/common';
import { IotModule } from 'src/iot/iot.module';
import { DashboardController } from './dashboard.controller';

@Module({ controllers: [DashboardController], imports: [IotModule] })
export class DashboardModule { }

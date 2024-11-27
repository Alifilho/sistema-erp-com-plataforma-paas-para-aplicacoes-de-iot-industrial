import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';

@Module({
  imports: [PrismaModule],
  providers: [IotService],
  controllers: [IotController],
  exports: [IotService],
})
export class IotModule {}

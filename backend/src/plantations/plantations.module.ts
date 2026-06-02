import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonModule } from '../phase3-common/phase3-common.module';
import { PlantationsController } from './plantations.controller';
import { PlantationsService } from './plantations.service';

@Module({
  imports: [PrismaModule, CommonAccessModule, Phase3CommonModule],
  controllers: [PlantationsController],
  providers: [PlantationsService],
  exports: [PlantationsService],
})
export class PlantationsModule {}
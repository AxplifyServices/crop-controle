import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonModule } from '../phase3-common/phase3-common.module';
import { PlantMovementsController } from './plant-movements.controller';
import { PlantMovementsService } from './plant-movements.service';

@Module({
  imports: [
    PrismaModule,
    CommonAccessModule,
    Phase3CommonModule,
  ],
  controllers: [PlantMovementsController],
  providers: [PlantMovementsService],
  exports: [PlantMovementsService],
})
export class PlantMovementsModule {}
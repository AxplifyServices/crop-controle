import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonModule } from '../phase3-common/phase3-common.module';
import { AgriculturalProjectsController } from './agricultural-projects.controller';
import { AgriculturalProjectsService } from './agricultural-projects.service';

@Module({
  imports: [PrismaModule, CommonAccessModule, Phase3CommonModule],
  controllers: [AgriculturalProjectsController],
  providers: [AgriculturalProjectsService],
  exports: [AgriculturalProjectsService],
})
export class AgriculturalProjectsModule {}
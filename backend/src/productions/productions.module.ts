import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonModule } from '../phase3-common/phase3-common.module';
import { ProductionsController } from './productions.controller';
import { ProductionsService } from './productions.service';

@Module({
  imports: [PrismaModule, CommonAccessModule, Phase3CommonModule],
  controllers: [ProductionsController],
  providers: [ProductionsService],
  exports: [ProductionsService],
})
export class ProductionsModule {}
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { ProductVarietiesController } from './product-varieties.controller';
import { ProductVarietiesService } from './product-varieties.service';

@Module({
  imports: [PrismaModule, CommonAccessModule],
  controllers: [ProductVarietiesController],
  providers: [ProductVarietiesService],
  exports: [ProductVarietiesService],
})
export class ProductVarietiesModule {}
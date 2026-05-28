import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductVarietiesController } from './product-varieties.controller';
import { ProductVarietiesService } from './product-varieties.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductVarietiesController],
  providers: [ProductVarietiesService],
  exports: [ProductVarietiesService],
})
export class ProductVarietiesModule {}

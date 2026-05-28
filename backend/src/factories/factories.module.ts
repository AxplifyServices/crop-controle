import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';

@Module({
  imports: [PrismaModule],
  controllers: [FactoriesController],
  providers: [FactoriesService],
  exports: [FactoriesService],
})
export class FactoriesModule {}

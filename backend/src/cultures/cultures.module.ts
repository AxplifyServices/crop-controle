import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { CulturesController } from './cultures.controller';
import { CulturesService } from './cultures.service';

@Module({
  imports: [PrismaModule, CommonAccessModule],
  controllers: [CulturesController],
  providers: [CulturesService],
  exports: [CulturesService],
})
export class CulturesModule {}
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonModule } from '../phase3-common/phase3-common.module';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';

@Module({
  imports: [PrismaModule, CommonAccessModule, Phase3CommonModule],
  controllers: [ChargesController],
  providers: [ChargesService],
  exports: [ChargesService],
})
export class ChargesModule {}
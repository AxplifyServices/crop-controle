import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { Phase3CommonService } from './phase3-common.service';

@Module({
  imports: [PrismaModule, CommonAccessModule],
  providers: [Phase3CommonService],
  exports: [Phase3CommonService],
})
export class Phase3CommonModule {}
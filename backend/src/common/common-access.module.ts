import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessControlService } from './access-control/access-control.service';

@Module({
  imports: [PrismaModule],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class CommonAccessModule {}
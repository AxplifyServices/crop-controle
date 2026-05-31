import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessControlService } from '../common/access-control/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AccessControlService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
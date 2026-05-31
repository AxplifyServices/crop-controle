import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonAccessModule } from '../common/common-access.module';
import { LegalIdentifierTypesController } from './legal-identifier-types.controller';
import { LegalIdentifierTypesService } from './legal-identifier-types.service';

@Module({
  imports: [PrismaModule, CommonAccessModule],
  controllers: [LegalIdentifierTypesController],
  providers: [LegalIdentifierTypesService],
  exports: [LegalIdentifierTypesService],
})
export class LegalIdentifierTypesModule {}
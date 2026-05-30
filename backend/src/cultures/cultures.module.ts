import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CulturesController } from './cultures.controller';
import { CulturesService } from './cultures.service';

@Module({
  imports: [PrismaModule],
  controllers: [CulturesController],
  providers: [CulturesService],
})
export class CulturesModule {}
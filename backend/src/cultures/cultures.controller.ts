import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CulturesService } from './cultures.service';
import { CreateCulturesDto, UpdateCulturesDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('cultures')
export class CulturesController {
  constructor(private readonly culturesService: CulturesService) {}

  @Get()
  findAll() {
    return this.culturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.culturesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCulturesDto) {
    return this.culturesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCulturesDto) {
    return this.culturesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.culturesService.remove(id);
  }
}
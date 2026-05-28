import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePlotsDto, UpdatePlotsDto } from './dto';
import { PlotsService } from './plots.service';

@UseGuards(JwtAuthGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly plotsService: PlotsService) {}

  @Get()
  findAll() {
    return this.plotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plotsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlotsDto) {
    return this.plotsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlotsDto) {
    return this.plotsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plotsService.remove(id);
  }
}

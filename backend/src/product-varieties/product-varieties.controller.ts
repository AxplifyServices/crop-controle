import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateProductVarietiesDto, UpdateProductVarietiesDto } from './dto';
import { ProductVarietiesService } from './product-varieties.service';

@UseGuards(JwtAuthGuard)
@Controller('product-varieties')
export class ProductVarietiesController {
  constructor(private readonly productVarietiesService: ProductVarietiesService) {}

  @Get()
  findAll() {
    return this.productVarietiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVarietiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductVarietiesDto) {
    return this.productVarietiesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductVarietiesDto) {
    return this.productVarietiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVarietiesService.remove(id);
  }
}

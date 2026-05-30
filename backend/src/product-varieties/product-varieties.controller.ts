import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CreateProductVarietiesDto, UpdateProductVarietiesDto } from './dto';
import { ProductVarietiesService } from './product-varieties.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('product-varieties')
export class ProductVarietiesController {
  constructor(
    private readonly productVarietiesService: ProductVarietiesService,
  ) {}

  @RequirePermission('product-varieties', 'VIEW')
  @Get()
  findAll() {
    return this.productVarietiesService.findAll();
  }

  @RequirePermission('product-varieties', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVarietiesService.findOne(id);
  }

  @RequirePermission('product-varieties', 'CREATE')
  @Post()
  create(@Body() dto: CreateProductVarietiesDto) {
    return this.productVarietiesService.create(dto);
  }

  @RequirePermission('product-varieties', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductVarietiesDto) {
    return this.productVarietiesService.update(id, dto);
  }

  @RequirePermission('product-varieties', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVarietiesService.remove(id);
  }
}
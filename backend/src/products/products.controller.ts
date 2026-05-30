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
import { CreateProductsDto, UpdateProductsDto } from './dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequirePermission('products', 'VIEW')
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @RequirePermission('products', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @RequirePermission('products', 'CREATE')
  @Post()
  create(@Body() dto: CreateProductsDto) {
    return this.productsService.create(dto);
  }

  @RequirePermission('products', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductsDto) {
    return this.productsService.update(id, dto);
  }

  @RequirePermission('products', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
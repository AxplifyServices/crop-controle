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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProductionsDto, UpdateProductionsDto } from './dto';
import { ProductionsService } from './productions.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('productions')
export class ProductionsController {
  constructor(private readonly productionsService: ProductionsService) {}

  @RequirePermission('productions', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.productionsService.findAll(user.sub);
  }

  @RequirePermission('productions', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionsService.findOne(id, user.sub);
  }

  @RequirePermission('productions', 'CREATE')
  @Post()
  create(@Body() dto: CreateProductionsDto, @CurrentUser() user: any) {
    return this.productionsService.create(dto, user.sub);
  }

  @RequirePermission('productions', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductionsDto,
    @CurrentUser() user: any,
  ) {
    return this.productionsService.update(id, dto, user.sub);
  }

  @RequirePermission('productions', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionsService.remove(id, user.sub);
  }
}
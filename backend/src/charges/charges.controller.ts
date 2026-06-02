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
import { CreateChargesDto, UpdateChargesDto } from './dto';
import { ChargesService } from './charges.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @RequirePermission('charges', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.chargesService.findAll(user.sub);
  }

  @RequirePermission('charges', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chargesService.findOne(id, user.sub);
  }

  @RequirePermission('charges', 'CREATE')
  @Post()
  create(@Body() dto: CreateChargesDto, @CurrentUser() user: any) {
    return this.chargesService.create(dto, user.sub);
  }

  @RequirePermission('charges', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChargesDto,
    @CurrentUser() user: any,
  ) {
    return this.chargesService.update(id, dto, user.sub);
  }

  @RequirePermission('charges', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chargesService.remove(id, user.sub);
  }
}
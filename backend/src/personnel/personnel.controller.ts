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
import { CreatePersonnelDto, UpdatePersonnelDto } from './dto';
import { PersonnelService } from './personnel.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @RequirePermission('personnel', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.personnelService.findAll(user.sub);
  }

  @RequirePermission('personnel', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.personnelService.findOne(id, user.sub);
  }

  @RequirePermission('personnel', 'CREATE')
  @Post()
  create(@Body() dto: CreatePersonnelDto, @CurrentUser() user: any) {
    return this.personnelService.create(dto, user.sub);
  }

  @RequirePermission('personnel', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonnelDto,
    @CurrentUser() user: any,
  ) {
    return this.personnelService.update(id, dto, user.sub);
  }

  @RequirePermission('personnel', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.personnelService.remove(id, user.sub);
  }
}
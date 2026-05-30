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
import { CreateGroupsDto, UpdateGroupsDto } from './dto';
import { GroupsService } from './groups.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @RequirePermission('groups', 'VIEW')
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @RequirePermission('groups', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @RequirePermission('groups', 'CREATE')
  @Post()
  create(@Body() dto: CreateGroupsDto) {
    return this.groupsService.create(dto);
  }

  @RequirePermission('groups', 'UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupsDto) {
    return this.groupsService.update(id, dto);
  }

  @RequirePermission('groups', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
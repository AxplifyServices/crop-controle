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
import { CreateGroupsDto, UpdateGroupsDto } from './dto';
import { GroupsService } from './groups.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @RequirePermission('groups', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.groupsService.findAll(user.sub);
  }

  @RequirePermission('groups', 'VIEW')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.findOne(id, user.sub);
  }

  @RequirePermission('groups', 'CREATE')
  @Post()
  create(@Body() dto: CreateGroupsDto, @CurrentUser() user: any) {
    return this.groupsService.create(dto, user.sub);
  }

  @RequirePermission('groups', 'UPDATE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupsDto,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.update(id, dto, user.sub);
  }

  @RequirePermission('groups', 'DELETE')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.remove(id, user.sub);
  }
}
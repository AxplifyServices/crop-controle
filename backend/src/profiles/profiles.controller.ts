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
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @RequirePermission('profiles', 'VIEW')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.profilesService.findAll(user.sub);
  }

  @RequirePermission('profiles', 'VIEW')
  @Get('meta')
  getMeta(@CurrentUser() user: any) {
    return this.profilesService.getMeta(user.sub);
  }

  @RequirePermission('profiles', 'VIEW')
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.profilesService.findOne(user.sub, id);
  }

  @RequirePermission('profiles', 'CREATE')
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(user.sub, dto);
  }

  @RequirePermission('profiles', 'UPDATE')
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user.sub, id, dto);
  }

  @RequirePermission('profiles', 'DELETE')
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.profilesService.remove(user.sub, id);
  }
}
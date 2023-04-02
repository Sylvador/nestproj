import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddRoleDto } from './dto';
import { Public, Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) { }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Get('/:value')
  getByValue(@Param('value') value: string) {
    return this.roleService.getRoleByValue(value);
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @Public()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/giverole')
  giveRole(@Body() dto: AddRoleDto) {
    return this.roleService.giveRole(dto);
  }
}
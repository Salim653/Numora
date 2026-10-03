import { Controller, Get, Inject, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../identity/admin.guard';
import {
  AdminClassDto,
  AdminClassListDto,
  AdminClassQueryDto,
  AdminUserDto,
  AdminUserListDto,
  AdminUserQueryDto,
} from './operations.dto';
import { AdminOperationsService } from './operations.service';

@ApiTags('admin-operations')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminOperationsController {
  constructor(
    @Inject(AdminOperationsService) private readonly operations: AdminOperationsService,
  ) {}
  @Get('users')
  @ApiOkResponse({ type: AdminUserListDto })
  users(@Query() query: AdminUserQueryDto) {
    return this.operations.users(query);
  }
  @Get('users/:userId')
  @ApiOkResponse({ type: AdminUserDto })
  user(@Param('userId', ParseUUIDPipe) id: string) {
    return this.operations.user(id);
  }
  @Get('classes')
  @ApiOkResponse({ type: AdminClassListDto })
  classes(@Query() query: AdminClassQueryDto) {
    return this.operations.classes(query);
  }
  @Get('classes/:classId')
  @ApiOkResponse({ type: AdminClassDto })
  class(@Param('classId', ParseUUIDPipe) id: string) {
    return this.operations.class(id);
  }
}

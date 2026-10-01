import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { SchoolsService } from './schools.service';

class SchoolDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
}
class SchoolListDto {
  @ApiProperty({ type: [SchoolDto] }) items!: SchoolDto[];
}
class VerifyTeacherDto {
  @ApiProperty({ minLength: 32, maxLength: 128 })
  @IsString()
  @Length(32, 128)
  token!: string;
}
class VerifiedDto {
  @ApiProperty() verified!: boolean;
}

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}

  @Get()
  @ApiOkResponse({ type: SchoolListDto })
  list(@Headers('authorization') authorization?: string) {
    return this.schools.listForTeacher(authorization);
  }

  @Post(':schoolId/teacher-verifications')
  @ApiCreatedResponse({ type: VerifiedDto })
  verify(
    @Headers('authorization') authorization: string | undefined,
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Body() body: VerifyTeacherDto,
  ) {
    return this.schools.verifyTeacher(authorization, schoolId, body.token);
  }
}

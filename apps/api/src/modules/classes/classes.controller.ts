import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { ClassesService } from './classes.service';

class ClassSummaryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) joinCode?: string;
}

class CreatedClassDto extends ClassSummaryDto {
  @ApiProperty() declare joinCode: string;
}
class CreateClassDto {
  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @Length(1, 80)
  @Matches(/\S/)
  name!: string;
}
class JoinClassDto {
  @ApiProperty({ minLength: 4, maxLength: 8, pattern: '^[A-Za-z0-9]+$' })
  @IsString()
  @Length(4, 8)
  @Matches(/^[A-Za-z0-9]+$/)
  joinCode!: string;
}
class JoinedClassDto {
  @ApiProperty({ type: ClassSummaryDto }) class!: ClassSummaryDto;
  @ApiProperty() joined!: boolean;
}

class StudentSummaryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() displayName!: string;
}

class ClassesResponseDto {
  @ApiProperty({ type: [ClassSummaryDto] }) items!: ClassSummaryDto[];
}

class ClassStudentsResponseDto {
  @ApiProperty({ type: ClassSummaryDto }) class!: ClassSummaryDto;
  @ApiProperty({ type: [StudentSummaryDto] }) items!: StudentSummaryDto[];
}

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get()
  @ApiOkResponse({ type: ClassesResponseDto })
  list(@Headers('authorization') authorization?: string) {
    return this.classes.list(authorization);
  }

  @Post()
  @ApiCreatedResponse({ type: CreatedClassDto })
  create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateClassDto,
  ) {
    return this.classes.create(authorization, body.name);
  }

  @Post('join')
  @ApiCreatedResponse({ type: JoinedClassDto })
  join(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: JoinClassDto,
  ) {
    return this.classes.join(authorization, body.joinCode);
  }

  @Get(':classId/students')
  @ApiParam({ name: 'classId', schema: { type: 'string', format: 'uuid' } })
  @ApiOkResponse({ type: ClassStudentsResponseDto })
  students(
    @Headers('authorization') authorization: string | undefined,
    @Param('classId', new ParseUUIDPipe()) classId: string,
  ) {
    return this.classes.students(authorization, classId);
  }
}

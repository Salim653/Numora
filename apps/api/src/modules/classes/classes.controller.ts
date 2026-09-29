import { Controller, Get, Headers, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './classes.service';

class ClassSummaryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
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

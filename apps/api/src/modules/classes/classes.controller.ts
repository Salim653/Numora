import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { ClassesService } from './classes.service';
import { CodeAttempt, CodeAttemptGuard } from '../security/code-attempt.guard';

class ClassSummaryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) joinCode?: string;
}

class CreatedClassDto extends ClassSummaryDto {
  @ApiProperty({ required: true }) declare joinCode: string;
}
class CreateClassDto {
  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @Length(1, 80)
  @Matches(/\S/)
  name!: string;
}
class JoinClassDto {
  @ApiProperty({ minLength: 6, maxLength: 32, pattern: '^(?:[A-Za-z0-9]{6}|[A-Za-z0-9_-]{8,32})$' })
  @IsString()
  @Length(6, 32)
  @Matches(/^(?:[A-Za-z0-9]{6}|[A-Za-z0-9_-]{8,32})$/)
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
  @CodeAttempt('class')
  @UseGuards(CodeAttemptGuard)
  @ApiResponse({
    status: 429,
    description: 'Attempt limit exceeded.',
    headers: { 'Retry-After': { schema: { type: 'integer' } } },
  })
  @ApiResponse({ status: 503, description: 'Attempt limiter unavailable.' })
  @ApiCreatedResponse({ type: JoinedClassDto })
  join(@Headers('authorization') authorization: string | undefined, @Body() body: JoinClassDto) {
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

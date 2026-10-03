import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ContentMutationDto, ContentPageDto } from '../content/content.dto';
import { AssessmentHistoryDto } from '../learning/learning.dto';
import { CreateFeedbackDto, FeedbackListDto, FeedbackSummaryDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';

export class ReadFeedbackDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'date-time' }) readAt!: string;
}
@ApiTags('feedback')
@ApiBearerAuth()
@Controller()
export class FeedbackController {
  constructor(@Inject(FeedbackService) private readonly feedback: FeedbackService) {}
  @Post('classes/:classId/students/:studentId/feedback')
  @ApiCreatedResponse({ type: ContentMutationDto })
  create(
    @Headers('authorization') auth: string | undefined,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() body: CreateFeedbackDto,
  ) {
    return this.feedback.create(auth, classId, studentId, body);
  }
  @Get('classes/:classId/students/:studentId/feedback')
  @ApiOkResponse({ type: FeedbackListDto })
  teacherList(
    @Headers('authorization') auth: string | undefined,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() page: ContentPageDto,
  ) {
    return this.feedback.teacherList(auth, classId, studentId, page);
  }
  @Get('classes/:classId/students/:studentId/assessment-results')
  @ApiOkResponse({ type: AssessmentHistoryDto })
  history(
    @Headers('authorization') auth: string | undefined,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('cursor', new ParseUUIDPipe({ optional: true })) cursor?: string,
  ) {
    return this.feedback.teacherHistory(auth, classId, studentId, cursor);
  }
  @Get('students/me/feedback')
  @ApiOkResponse({ type: FeedbackListDto })
  studentList(@Headers('authorization') auth: string | undefined, @Query() page: ContentPageDto) {
    return this.feedback.studentList(auth, page);
  }
  @Get('students/me/feedback/summary')
  @ApiOkResponse({ type: FeedbackSummaryDto })
  summary(@Headers('authorization') auth: string | undefined) {
    return this.feedback.summary(auth);
  }
  @Post('students/me/feedback/:feedbackId/read')
  @ApiCreatedResponse({ type: ReadFeedbackDto })
  read(
    @Headers('authorization') auth: string | undefined,
    @Param('feedbackId', ParseUUIDPipe) id: string,
  ) {
    return this.feedback.markRead(auth, id);
  }
}

import { Body, Controller, Get, Headers, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ContentMutationDto } from '../content/content.dto';
import {
  StudentQuestionReportDto,
  StudentVideoReportDto,
  StudentVideosDto,
  LearningInteractionDto,
  LearningInteractionReceiptDto,
} from './student-support.dto';
import { StudentSupportService } from './student-support.service';

@ApiTags('student-support')
@ApiBearerAuth()
@Controller('students/me')
export class StudentSupportController {
  constructor(@Inject(StudentSupportService) private readonly support: StudentSupportService) {}
  @Post('learning-interactions')
  @ApiCreatedResponse({ type: LearningInteractionReceiptDto })
  interaction(
    @Headers('authorization') auth: string | undefined,
    @Body() body: LearningInteractionDto,
  ) {
    return this.support.interaction(auth, body);
  }
  @Get('drill-attempts/:attemptId/videos')
  @ApiOkResponse({ type: StudentVideosDto })
  videos(
    @Headers('authorization') auth: string | undefined,
    @Param('attemptId', ParseUUIDPipe) id: string,
  ) {
    return this.support.videos(auth, id);
  }
  @Post('question-reports')
  @ApiCreatedResponse({ type: ContentMutationDto })
  question(
    @Headers('authorization') auth: string | undefined,
    @Body() body: StudentQuestionReportDto,
  ) {
    return this.support.questionReport(auth, body);
  }
  @Post('video-reports')
  @ApiCreatedResponse({ type: ContentMutationDto })
  video(@Headers('authorization') auth: string | undefined, @Body() body: StudentVideoReportDto) {
    return this.support.videoReport(auth, body);
  }
}

import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import {
  CatalogDto,
  AssessmentHistoryDto,
  CurrentTryoutDto,
  ChapterDetailDto,
  DrillAttemptDto,
  DrillResultDto,
  SaveDrillAnswerDto,
  SavedAnswerDto,
  StartDrillDto,
  StudentProgressDto,
  SubchapterDetailDto,
} from './learning.dto';

@ApiTags('core-learning')
@ApiBearerAuth()
@Controller()
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('chapters')
  @ApiOkResponse({ type: CatalogDto })
  catalog(@Headers('authorization') authorization?: string) {
    return this.learning.catalog(authorization);
  }

  @Get('chapters/:chapterId')
  @ApiOkResponse({ type: ChapterDetailDto })
  chapter(
    @Headers('authorization') authorization: string | undefined,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.learning.chapter(authorization, chapterId);
  }

  @Get('subchapters/:subchapterId')
  @ApiOkResponse({ type: SubchapterDetailDto })
  subchapter(
    @Headers('authorization') authorization: string | undefined,
    @Param('subchapterId', ParseUUIDPipe) subchapterId: string,
  ) {
    return this.learning.subchapter(authorization, subchapterId);
  }

  @Get('students/me/progress')
  @ApiOkResponse({ type: StudentProgressDto })
  progress(@Headers('authorization') authorization?: string) {
    return this.learning.progress(authorization);
  }

  @Get('students/me/assessment-results')
  @ApiQuery({ name: 'cursor', required: false })
  @ApiOkResponse({ type: AssessmentHistoryDto })
  history(
    @Headers('authorization') authorization?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.learning.history(authorization, cursor);
  }

  @Get('tryout/packages/current')
  @ApiOkResponse({ type: CurrentTryoutDto })
  currentTryout(@Headers('authorization') authorization?: string) {
    return this.learning.currentTryout(authorization);
  }

  @Post('assessments/drill/attempts')
  @ApiCreatedResponse({ type: DrillAttemptDto })
  start(@Headers('authorization') authorization: string | undefined, @Body() input: StartDrillDto) {
    return this.learning.start(authorization, input.levelId);
  }

  @Get('assessment-attempts/:attemptId')
  @ApiOkResponse({ type: DrillAttemptDto })
  attempt(
    @Headers('authorization') authorization: string | undefined,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.learning.attempt(authorization, attemptId);
  }

  @Patch('assessment-attempts/:attemptId/answers/:questionInstanceId')
  @ApiOkResponse({ type: SavedAnswerDto })
  saveAnswer(
    @Headers('authorization') authorization: string | undefined,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Param('questionInstanceId', ParseUUIDPipe) questionInstanceId: string,
    @Body() input: SaveDrillAnswerDto,
  ) {
    return this.learning.saveAnswer(authorization, attemptId, questionInstanceId, input.optionId);
  }

  @Post('assessment-attempts/:attemptId/submit')
  @ApiCreatedResponse({ type: DrillResultDto })
  submit(
    @Headers('authorization') authorization: string | undefined,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.learning.submit(authorization, attemptId);
  }

  @Get('assessment-attempts/:attemptId/result')
  @ApiOkResponse({ type: DrillResultDto })
  result(
    @Headers('authorization') authorization: string | undefined,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.learning.result(authorization, attemptId);
  }
}

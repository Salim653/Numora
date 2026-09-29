import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import {  CreateChapterDto, CreateLevelDto, CreateRelatedVideoDto, CreateSubchapterDto, UpdateChapterDto, UpdateLevelDto, UpdateRelatedVideoDto, UpdateSubchapterDto } from './dto/content.dto';

import {  CreateQuestionDto, CreateQuestionVersionDto, CreateTryoutPackageDto, UpdateQuestionDto, UpdateQuestionStatusDto, UpdateTryoutPackageDto } from './dto/content.dto';
import { contentStatus, tryoutPackageStatus } from '@tka/database';

type ContentStatus = (typeof contentStatus.enumValues)[number];
type PackageStatus = (typeof tryoutPackageStatus.enumValues)[number];


@ApiTags('admin')
@Controller('admin')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('curriculum')
  curriculum() {
    return this.content.listHierarchy();
  }

  @Post('chapters')
  createChapter(@Body() dto: CreateChapterDto) {
    return this.content.createChapter(dto);
  }

  @Patch('chapters/:id')
  updateChapter(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.content.updateChapter(id, dto);
  }

  @Post('subchapters')
  createSubchapter(@Body() dto: CreateSubchapterDto) {
    return this.content.createSubchapter(dto);
  }

  @Patch('subchapters/:id')
  updateSubchapter(@Param('id') id: string, @Body() dto: UpdateSubchapterDto) {
    return this.content.updateSubchapter(id, dto);
  }

  @Post('levels')
  createLevel(@Body() dto: CreateLevelDto) {
    return this.content.createLevel(dto);
  }

  @Patch('levels/:id')
  updateLevel(@Param('id') id: string, @Body() dto: UpdateLevelDto) {
    return this.content.updateLevel(id, dto);
  }

  @Post('subchapters/:subchapterId/videos')
  createVideo(@Param('subchapterId') subchapterId: string, @Body() dto: CreateRelatedVideoDto) {
    return this.content.createVideo(subchapterId, dto);
  }

  @Patch('videos/:id')
  updateVideo(@Param('id') id: string, @Body() dto: UpdateRelatedVideoDto) {
    return this.content.updateVideo(id, dto);
  }

  @Delete('videos/:id')
  removeVideo(@Param('id') id: string) {
    return this.content.removeVideo(id);
  }

  @Get('questions')
  listQuestions(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: ContentStatus) {
    return this.content.listQuestions({ page: Number(page) || 1, limit: Number(limit) || 20, status });
  }

  @Post('questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.content.createQuestion(dto);
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string) {
    return this.content.getQuestion(id);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.content.updateQuestion(id, dto);
  }

  @Patch('questions/:id/status')
  updateQuestionStatus(@Param('id') id: string, @Body() dto: UpdateQuestionStatusDto) {
    return this.content.updateQuestionStatus(id, dto.status);
  }

  @Post('questions/:questionId/versions')
  createVersion(@Param('questionId') questionId: string, @Body() dto: CreateQuestionVersionDto) {
    return this.content.createVersion(questionId, dto);
  }

  @Post('question-versions/:id/publish')
  publishVersion(@Param('id') id: string) {
    return this.content.publishVersion(id);
  }

  @Post('question-versions/:id/clone')
  cloneVersion(@Param('id') id: string) {
    return this.content.cloneVersion(id);
  }

  @Get('tryout-packages')
  listPackages(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: PackageStatus) {
    return this.content.listPackages({ page: Number(page) || 1, limit: Number(limit) || 20, status });
  }

  @Post('tryout-packages')
  createPackage(@Body() dto: CreateTryoutPackageDto) {
    return this.content.createPackage(dto);
  }

  @Get('tryout-packages/:id')
  getPackage(@Param('id') id: string) {
    return this.content.getPackage(id);
  }

  @Patch('tryout-packages/:id')
  updatePackage(@Param('id') id: string, @Body() dto: UpdateTryoutPackageDto) {
    return this.content.updatePackage(id, dto);
  }

  @Post('tryout-packages/:id/publish')
  publishPackage(@Param('id') id: string) {
    return this.content.publishPackage(id);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsUUID } from 'class-validator';

export class StartDrillDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  levelId!: string;
}

export class SaveDrillAnswerDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'A-D for demo; null clears the answer.',
  })
  @Allow()
  optionId!: string | null;
}

export class ChapterDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() order!: number;
}

export class SubchapterDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) chapterId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() order!: number;
}

export class LevelDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() order!: number;
  @ApiProperty({ enum: ['locked', 'open', 'inProgress', 'completed'] }) status!: string;
  @ApiProperty({ type: Number, nullable: true }) latestScore!: number | null;
  @ApiProperty({ type: Number, nullable: true }) bestScore!: number | null;
}

export class CatalogDto {
  @ApiProperty({ type: [ChapterDto] }) chapters!: ChapterDto[];
}
export class ChapterDetailDto {
  @ApiProperty({ type: ChapterDto }) chapter!: ChapterDto;
  @ApiProperty({ type: [SubchapterDto] }) subchapters!: SubchapterDto[];
}
export class SubchapterDetailDto {
  @ApiProperty({ type: SubchapterDto }) subchapter!: SubchapterDto;
  @ApiProperty({ type: [LevelDto] }) levels!: LevelDto[];
}
export class StudentProgressDto {
  @ApiProperty() completedLevels!: number;
  @ApiProperty() totalLevels!: number;
  @ApiProperty({ type: Number, nullable: true }) latestScore!: number | null;
}

export class OptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() text!: string;
}
export class DrillQuestionDto {
  @ApiProperty({ format: 'uuid' }) questionInstanceId!: string;
  @ApiProperty() stem!: string;
  @ApiProperty({ type: [OptionDto] }) options!: OptionDto[];
  @ApiProperty({ type: String, nullable: true }) selectedOptionId!: string | null;
}
export class DrillAttemptDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) levelId!: string;
  @ApiProperty() levelTitle!: string;
  @ApiProperty({ enum: ['inProgress', 'completed'] }) status!: string;
  @ApiProperty({ format: 'date-time' }) startedAt!: string;
  @ApiProperty() isDemo!: boolean;
  @ApiProperty({ type: [DrillQuestionDto] }) questions!: DrillQuestionDto[];
}
export class SavedAnswerDto {
  @ApiProperty({ format: 'uuid' }) questionInstanceId!: string;
  @ApiProperty({ type: String, nullable: true }) selectedOptionId!: string | null;
}
export class ReviewedQuestionDto extends DrillQuestionDto {
  @ApiProperty() correctOptionId!: string;
  @ApiProperty() explanation!: string;
}
export class DrillResultDto {
  @ApiProperty({ format: 'uuid' }) attemptId!: string;
  @ApiProperty({ format: 'uuid' }) levelId!: string;
  @ApiProperty() levelTitle!: string;
  @ApiProperty() score!: number;
  @ApiProperty() rawPoints!: number;
  @ApiProperty() correctCount!: number;
  @ApiProperty() questionCount!: number;
  @ApiProperty() mastered!: boolean;
  @ApiProperty({ type: Number, nullable: true }) stars!: number | null;
  @ApiProperty({ type: String, format: 'uuid', nullable: true }) unlockedLevelId!: string | null;
  @ApiProperty() isDemo!: boolean;
  @ApiProperty({ enum: ['available', 'expired'] }) explanationState!: string;
  @ApiProperty({ type: [ReviewedQuestionDto] }) questions!: ReviewedQuestionDto[];
}

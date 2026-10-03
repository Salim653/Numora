import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class StudentVideoDto {
  @ApiProperty() mappingId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() url!: string;
  @ApiProperty() source!: string;
}
export class StudentVideosDto {
  @ApiProperty({ type: [StudentVideoDto] }) items!: StudentVideoDto[];
}
export class ReportDetailsDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((_o, value) => value !== undefined)
  @IsUUID()
  clientRequestId?: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(80) @Matches(/\S/) category!: string;
  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  @MaxLength(2000)
  details?: string;
}
export class StudentQuestionReportDto extends ReportDetailsDto {
  @ApiProperty({ enum: ['QUESTION', 'OPTION', 'ANSWER_KEY', 'EXPLANATION'] })
  @IsIn(['QUESTION', 'OPTION', 'ANSWER_KEY', 'EXPLANATION'])
  declare category: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() attemptItemId!: string;
}
export class StudentVideoReportDto extends ReportDetailsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() attemptId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() mappingId!: string;
}

// PROPOSED payload mapping, inactive until Data review. All context is verified server-side.
export class LearningInteractionDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() clientRequestId!: string;
  @ApiProperty({
    enum: [
      'tryout_opened',
      'tryout_detail_viewed',
      'explanation_viewed',
      'video_clicked',
    ],
  })
  @IsIn([
    'tryout_opened',
    'tryout_detail_viewed',
    'explanation_viewed',
    'video_clicked',
  ])
  eventName!: string;
  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((_o, value) => value !== undefined)
  @IsUUID()
  attemptId?: string;
  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((_o, value) => value !== undefined)
  @IsUUID()
  mappingId?: string;
  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((_o, value) => value !== undefined)
  @IsUUID()
  packageId?: string;
}
export class LearningInteractionReceiptDto {
  @ApiProperty({ enum: ['recorded', 'policyPending'] }) state!: string;
}

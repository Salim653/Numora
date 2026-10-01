import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

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
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(80) @Matches(/\S/) category!: string;
  @ApiPropertyOptional()
  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  @MaxLength(2000)
  details?: string;
}
export class StudentQuestionReportDto extends ReportDetailsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() attemptItemId!: string;
}
export class StudentVideoReportDto extends ReportDetailsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() attemptId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() mappingId!: string;
}

import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { reportStatus } from '@tka/database';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reporterId!: string;

  @IsEnum(['QUESTION', 'VIDEO'])
  referenceType!: 'QUESTION' | 'VIDEO';

  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsEnum(reportStatus.enumValues)
  status?: (typeof reportStatus.enumValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string;
}

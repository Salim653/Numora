import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { contentStatus, tryoutPackageStatus } from '@tka/database';

// ---------------- Pagination / filters ----------------

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ContentStatusFilterDto {
  @IsOptional()
  @IsEnum(contentStatus.enumValues)
  status?: (typeof contentStatus.enumValues)[number];
}

export class PackageStatusFilterDto {
  @IsOptional()
  @IsEnum(tryoutPackageStatus.enumValues)
  status?: (typeof tryoutPackageStatus.enumValues)[number];
}

// ---------------- Taxonomy ----------------

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sortOrder?: number;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class CreateSubchapterDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sortOrder?: number;
}

export class UpdateSubchapterDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  subchapterId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sortOrder?: number;
}

export class UpdateLevelDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class CreateRelatedVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateRelatedVideoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

// ---------------- Questions ----------------

export class UpdateQuestionStatusDto {
  @IsEnum(contentStatus.enumValues)
  status!: (typeof contentStatus.enumValues)[number];
}


export class ChoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  key!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  levelId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @IsString()
  @IsNotEmpty()
  stemLatex!: string;

  @IsOptional()
  @IsString()
  explanationLatex?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(32)
  type?: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  stemLatex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  type?: string;

  @IsOptional()
  @IsString()
  explanationLatex?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateQuestionVersionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices!: ChoiceDto[];

  @IsOptional()
  @IsString()
  rationale?: string;

  @IsOptional()
  @IsObject()
  contentSnapshot?: Record<string, unknown>;
}

// ---------------- Tryout packages ----------------

export class CreateTryoutPackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionVersionIds?: string[];
}

export class UpdateTryoutPackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionVersionIds?: string[];
}

// ---------------- IRT ----------------

export class UpsertIrtAggregateDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  responseCount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctCount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  difficulty?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discrimination?: number | null;
}

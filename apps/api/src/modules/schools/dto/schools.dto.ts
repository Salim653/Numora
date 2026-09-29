import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { schoolStatus } from '@tka/database';
import { PaginationDto } from '../../content/dto/content.dto';

export class ListSchoolsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(schoolStatus.enumValues)
  status?: (typeof schoolStatus.enumValues)[number];
}

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;
}

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;
}

export class UpdateSchoolStatusDto {
  @IsEnum(schoolStatus.enumValues)
  status!: (typeof schoolStatus.enumValues)[number];
}

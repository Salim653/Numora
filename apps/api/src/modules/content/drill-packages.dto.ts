import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDrillPackageDto {
  @ApiProperty() @IsString() @Matches(/^[A-Za-z0-9-]{1,64}$/) familyCode!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(100_000) packageVersion!: number;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(160) @Matches(/\S/) name!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() levelId!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(100_000) variantIndex!: number;
  @ApiProperty({ format: 'uuid' }) @IsUUID() scoringPolicyVersionId!: string;
  @ApiProperty({ type: [String], maxItems: 10 })
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  questionVersionIds!: string[];
}
export class UpdateDrillPackageDto extends OmitType(CreateDrillPackageDto, [
  'familyCode',
  'packageVersion',
  'levelId',
  'variantIndex',
]) {}
export class AdminDrillPackageDto {
  @ApiProperty() id!: string;
  @ApiProperty() familyCode!: string;
  @ApiProperty() packageVersion!: number;
  @ApiProperty() name!: string;
  @ApiProperty() levelId!: string;
  @ApiProperty() variantIndex!: number;
  @ApiProperty() scoringPolicyVersionId!: string;
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'] }) status!: string;
  @ApiProperty({ type: String, nullable: true }) releaseAt!: string | null;
  @ApiProperty({ type: [String] }) questionVersionIds!: string[];
}
export class AdminDrillPackagesDto {
  @ApiProperty({ type: [AdminDrillPackageDto] }) items!: AdminDrillPackageDto[];
}

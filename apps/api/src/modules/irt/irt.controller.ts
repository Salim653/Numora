import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IrtService } from './irt.service';
import { AdminGuard } from '../identity/admin.guard';
import { ContentPageDto } from '../content/content.dto';

export class AdminIrtItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() batchId!: string;
  @ApiProperty() questionVersionId!: string;
  @ApiProperty() modelVersion!: string;
  @ApiProperty() batchStatus!: string;
  @ApiProperty() sampleSize!: number;
  @ApiProperty() dataStatus!: string;
  @ApiProperty({ type: String, nullable: true }) difficultyB!: string | null;
  @ApiProperty({ type: String, nullable: true }) discriminationA!: string | null;
  @ApiProperty({ type: String, nullable: true }) guessingC!: string | null;
}
export class AdminIrtDto {
  @ApiProperty({ type: [AdminIrtItemDto] }) items!: AdminIrtItemDto[];
}
export class AdminIrtBatchDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: String, nullable: true }) packageId!: string | null;
  @ApiProperty() batchKind!: string;
  @ApiProperty() modelVersion!: string;
  @ApiProperty({ enum: ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'] }) status!: string;
  @ApiProperty() startedAt!: string;
  @ApiProperty({ type: String, nullable: true }) finishedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) resultReleasedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) failureCode!: string | null;
}
export class AdminIrtBatchesDto {
  @ApiProperty({ type: [AdminIrtBatchDto] }) items!: AdminIrtBatchDto[];
}

// Read existing batch output only. Model configuration/computation remains OPEN-12/18.
@ApiTags('admin-irt')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/irt')
export class IrtController {
  constructor(@Inject(IrtService) private readonly irt: IrtService) {}
  @Get()
  @ApiOkResponse({ type: AdminIrtDto })
  list(@Query() page: ContentPageDto) {
    return this.irt.list(page);
  }
  @Get('batches')
  @ApiOkResponse({ type: AdminIrtBatchesDto })
  batches(@Query() page: ContentPageDto) {
    return this.irt.batches(page);
  }
}

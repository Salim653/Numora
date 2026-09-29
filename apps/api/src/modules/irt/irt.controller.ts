import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEMO_ADMIN_AUTH_ID } from '../../config/demo-actor';
import { UpsertIrtAggregateDto } from '../content/dto/content.dto';
import { IrtService } from './irt.service';

/**
 * IRT aggregate administration. PRD baseline: metrics are hidden until at
 * least 30 responses exist. This surface is for admin/tooling upserts; the
 * daily batch pipeline is out of scope here.
 */
@ApiTags('admin')
@Controller('admin')
export class IrtController {
  constructor(private readonly irt: IrtService) {}

  @Get('irt/question-versions/:questionVersionId')
  getAggregate(@Param('questionVersionId') questionVersionId: string) {
    return this.irt.getAggregate(questionVersionId);
  }

  @Put('irt/question-versions/:questionVersionId')
  upsertAggregate(
    @Param('questionVersionId') questionVersionId: string,
    @Body() dto: UpsertIrtAggregateDto,
  ) {
    return this.irt.upsertAggregate(questionVersionId, dto);
  }
}

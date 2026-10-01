import { Controller, Get, Headers, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PvpAvailabilityDto, PvpInvitesDto, PvpSnapshotDto, StudentPeersDto } from './pvp.dto';
import { PvpService } from './pvp.service';

@ApiTags('pvp')
@ApiBearerAuth()
@Controller('pvp')
export class PvpController {
  constructor(private readonly service: PvpService) {}
  @Get('availability')
  @ApiOkResponse({ type: PvpAvailabilityDto })
  availability(@Headers('authorization') authorization?: string) {
    return this.service.availability(authorization);
  }
  @Get('classmates')
  @ApiOkResponse({ type: StudentPeersDto })
  classmates(@Headers('authorization') authorization?: string) {
    return this.service.classmates(authorization);
  }
  @Get('invitations')
  @ApiOkResponse({ type: PvpInvitesDto })
  invites(@Headers('authorization') authorization?: string) {
    return this.service.invitations(authorization);
  }
  @Get('matches/:matchId')
  @ApiOkResponse({ type: PvpSnapshotDto })
  result(
    @Headers('authorization') authorization: string | undefined,
    @Param('matchId', ParseUUIDPipe) matchId: string,
  ) {
    return this.service.result(authorization, matchId);
  }
}

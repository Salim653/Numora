import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardsService } from './leaderboards.service';
@Module({
  imports: [IdentityModule],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService],
})
export class LeaderboardsModule {}

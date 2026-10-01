import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { IrtController } from './irt.controller';
import { IrtService } from './irt.service';
@Module({ imports: [IdentityModule], controllers: [IrtController], providers: [IrtService] })
export class IrtModule {}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IdentityService } from './identity.service';

export type AdminRequest = { headers: { authorization?: string }; adminId: string };

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(IdentityService) private readonly identity: IdentityService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const profile = await this.identity.me(request.headers.authorization);
    if (profile.role !== 'ADMIN' || profile.status !== 'ACTIVE') {
      throw new ForbiddenException('Active Admin access is required.');
    }
    request.adminId = profile.id;
    return true;
  }
}

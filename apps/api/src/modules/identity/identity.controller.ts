import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { IdentityService } from './identity.service';

class RegistrationDto {
  @ApiProperty({ enum: ['STUDENT', 'TEACHER'] })
  @IsIn(['STUDENT', 'TEACHER'])
  role!: 'STUDENT' | 'TEACHER';

  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;
}

class IdentityProfileDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['STUDENT', 'TEACHER'] }) role!: 'STUDENT' | 'TEACHER';
  @ApiProperty() displayName!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: ['ACTIVE'] }) status!: 'ACTIVE';
  @ApiProperty() teacherVerified!: boolean;
}

@ApiTags('identity')
@ApiBearerAuth()
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Get('me')
  @ApiOkResponse({ type: IdentityProfileDto })
  getMe(@Headers('authorization') authorization?: string) {
    return this.identity.me(authorization);
  }

  @Post('registrations')
  @ApiCreatedResponse({ type: IdentityProfileDto })
  register(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: RegistrationDto,
  ) {
    return this.identity.register(authorization, body.role, body.displayName);
  }
}

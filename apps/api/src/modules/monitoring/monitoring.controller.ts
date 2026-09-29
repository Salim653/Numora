import { Controller, Get, Headers, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

class StudentDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() displayName!: string;
}
class ClassDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
}
class MonitoredLevelDto {
  @ApiProperty({ format: 'uuid' }) levelId!: string;
  @ApiProperty() chapterLabel!: string;
  @ApiProperty() subchapterLabel!: string;
  @ApiProperty() levelLabel!: string;
  @ApiProperty({ enum: ['LOCKED', 'UNLOCKED'] }) accessStatus!: string;
  @ApiProperty() inProgress!: boolean;
  @ApiProperty({ type: Number, nullable: true }) latestDrillScore!: number | null;
  @ApiProperty({ type: Number, nullable: true }) bestDrillScore!: number | null;
}
class TeacherStudentProgressDto {
  @ApiProperty({ type: ClassDto }) class!: ClassDto;
  @ApiProperty({ type: StudentDto }) student!: StudentDto;
  @ApiProperty({ type: Number, nullable: true }) latestDrillScore!: number | null;
  @ApiProperty({ type: [MonitoredLevelDto] }) levels!: MonitoredLevelDto[];
}

@ApiTags('monitoring')
@ApiBearerAuth()
@Controller('classes/:classId/students/:studentId/progress')
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get()
  @ApiOkResponse({ type: TeacherStudentProgressDto })
  read(
    @Headers('authorization') authorization: string | undefined,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.monitoring.studentProgress(authorization, classId, studentId);
  }
}

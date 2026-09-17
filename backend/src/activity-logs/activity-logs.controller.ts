import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll(@Query() query: QueryActivityLogDto) {
    return this.activityLogsService.findAll(query);
  }

  @Get('recent')
  getRecent(@Query('limit') limit?: number) {
    return this.activityLogsService.getRecent(limit ? Number(limit) : 10);
  }

  @Get('stats')
  getStats() {
    return this.activityLogsService.getStats();
  }
}

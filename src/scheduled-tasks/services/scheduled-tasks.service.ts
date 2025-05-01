import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { SyncService } from 'src/sync/services/sync.service';

@Injectable()
export class ScheduledTasksService {
  constructor(private readonly syncService: SyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async scheduledSyncMovies() {
    try {
      Logger.log(ResponseMessages.SCHEDULED_MOVIE_SYNC_STARTED, 'ScheduledTasksService');
      await this.syncService.syncMovies();
      Logger.log(ResponseMessages.SCHEDULED_MOVIE_SYNC_SUCCESS, 'ScheduledTasksService');
    } catch (error) {
      Logger.error(error, 'ScheduledTasksService');
    }
  }
}

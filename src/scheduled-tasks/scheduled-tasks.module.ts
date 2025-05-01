import { Module } from '@nestjs/common';
import { SyncModule } from 'src/sync/sync.module';
import { ScheduledTasksService } from './services/scheduled-tasks.service';

@Module({
  imports: [SyncModule],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}

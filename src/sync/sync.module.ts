import { Module } from '@nestjs/common';
import { ExternalApisModule } from 'src/external-apis/external-apis.module';
import { MoviesModule } from 'src/movies/movies.module';
import { SyncController } from './controllers/sync.controller';
import { SyncService } from './services/sync.service';

@Module({
  controllers: [SyncController],
  providers: [SyncService],
  imports: [ExternalApisModule, MoviesModule],
  exports: [SyncService],
})
export class SyncModule {}

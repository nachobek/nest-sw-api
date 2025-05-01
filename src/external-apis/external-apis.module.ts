import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SwApiService } from './services/sw-api.service';

@Module({
  imports: [
    HttpModule.register({
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
  providers: [SwApiService],
  exports: [SwApiService],
})
export class ExternalApisModule {}

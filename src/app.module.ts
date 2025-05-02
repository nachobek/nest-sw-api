import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { SequelizeConfigService } from './config/services/sequelize-config.service';
import { SwaggerService } from './config/services/swagger.service';
import { ExternalApisModule } from './external-apis/external-apis.module';
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    AuthModule,
    ExternalApisModule,
    UsersModule,
    SyncModule,
    ScheduledTasksModule,
  ],
  providers: [SwaggerService],
})
export class AppModule {}

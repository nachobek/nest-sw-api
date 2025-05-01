import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { SequelizeConfigService } from './config/services/sequelize-config.service';
import { SwaggerService } from './config/services/swagger.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ScheduleModule.forRoot(),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    UsersModule,
  ],
  providers: [SwaggerService],
})
export class AppModule {}

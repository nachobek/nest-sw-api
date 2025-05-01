import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './controllers/users.controller';
import { User } from './models/user.model';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([User])],
  exports: [UsersService],
})
export class UsersModule {}

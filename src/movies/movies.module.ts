import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MoviesController } from './controllers/movies.controller';
import { Movie } from './models/movie.model';
import { MoviesService } from './services/movies.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [SequelizeModule.forFeature([Movie])],
  exports: [MoviesService],
})
export class MoviesModule {}

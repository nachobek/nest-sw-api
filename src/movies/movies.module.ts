import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CharactersController } from './controllers/characters.controller';
import { MoviesController } from './controllers/movies.controller';
import { CharacterMovie } from './models/character-movie.model';
import { Character } from './models/character.model';
import { Movie } from './models/movie.model';
import { CharactersService } from './services/characters.service';
import { MoviesService } from './services/movies.service';

@Module({
  controllers: [MoviesController, CharactersController],
  providers: [MoviesService, CharactersService],
  imports: [SequelizeModule.forFeature([Movie, Character, CharacterMovie])],
  exports: [MoviesService, CharactersService],
})
export class MoviesModule {}

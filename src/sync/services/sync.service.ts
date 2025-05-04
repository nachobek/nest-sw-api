import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { SwApiService } from 'src/external-apis/services/sw-api.service';
import { CreateCharacterDto } from 'src/movies/dtos/create-character.dto';
import { CreateMovieDto } from 'src/movies/dtos/create-movie.dto';
import { Source } from 'src/movies/enum/source.enum';
import { CharactersService } from 'src/movies/services/characters.service';
import { MoviesService } from 'src/movies/services/movies.service';

@Injectable()
export class SyncService {
  private isSyncRunning = false;

  constructor(
    private readonly swApiService: SwApiService,
    private readonly movieService: MoviesService,
    private readonly characterService: CharactersService,
  ) {}

  async generalSync() {
    if (this.isSyncRunning) {
      throw new BadRequestException(ResponseMessages.SYNC_ALREADY_RUNNING);
    }

    this.isSyncRunning = true;

    try {
      await this.cleanUpData();
      await this.syncCharacters();
      await this.syncMovies();
    } catch (error) {
      this.isSyncRunning = false;
      Logger.error(error, 'SyncService');
      throw error;
    }

    this.isSyncRunning = false;
  }

  private async cleanUpData() {
    try {
      await this.characterService.forceDeleteAllSwApiCharacters();
      await this.movieService.forceDeleteAllSwApiMovies();
    } catch (error) {
      Logger.error(error, 'SyncService');
      throw new InternalServerErrorException(ResponseMessages.CLEAN_UP_DATA_ERROR);
    }
  }

  private async syncCharacters() {
    try {
      const { results: swApiCharacters } = await this.swApiService.getCharacters();

      if (swApiCharacters.length) {
        const charactersToCreate: CreateCharacterDto[] = [];

        for (const swApiCharacter of swApiCharacters) {
          const character: CreateCharacterDto = {
            name: swApiCharacter.name,
            height: swApiCharacter.height,
            mass: swApiCharacter.mass,
            hair_color: swApiCharacter.hair_color,
            skin_color: swApiCharacter.skin_color,
            eye_color: swApiCharacter.eye_color,
            birth_year: swApiCharacter.birth_year,
            gender: swApiCharacter.gender,
            url: swApiCharacter.url,
            source: Source.SWAPI,
          };

          charactersToCreate.push(character);
        }

        await this.characterService.createMany(charactersToCreate);
      }

      Logger.log(ResponseMessages.CHARACTER_SYNC_SUCCESS, 'SyncService');
    } catch (error) {
      Logger.error(error, 'SyncService');
      throw new InternalServerErrorException(ResponseMessages.CHARACTER_SYNC_ERROR);
    }
  }

  private async syncMovies() {
    try {
      const { results: swApiMovies } = await this.swApiService.getMovies();

      if (swApiMovies.length) {
        const moviesToCreate: CreateMovieDto[] = [];

        for (const swMovie of swApiMovies) {
          if (!swMovie.title) {
            continue;
          }

          const releaseDate = new Date(swMovie.release_date);

          if (isNaN(releaseDate.getTime())) {
            continue;
          }

          const movie: CreateMovieDto = {
            title: swMovie.title,
            episodeId: swMovie.episode_id,
            openingCrawl: swMovie.opening_crawl,
            director: swMovie.director,
            producer: swMovie.producer,
            releaseDate,
            url: swMovie.url,
            source: Source.SWAPI,
          };

          moviesToCreate.push(movie);
        }

        const createdMovies = await this.movieService.createMany(moviesToCreate);

        if (createdMovies.length) {
          const characters = await this.characterService.findAll({
            attributes: ['id', 'url'],
            where: { source: Source.SWAPI },
          });

          for (const movie of createdMovies) {
            const { characters: swApiMovieCharacterUrls } = swApiMovies.find(
              (swMovie) => swMovie.url === movie.url,
            );

            if (!swApiMovieCharacterUrls || !swApiMovieCharacterUrls.length) {
              continue;
            }

            const characterIds: number[] = [];

            for (const swApiMovieCharacterUrl of swApiMovieCharacterUrls) {
              const character = characters.find(
                (character) => character.url === swApiMovieCharacterUrl,
              );

              if (character) {
                characterIds.push(character.id);
              }
            }

            await movie.setCharacters(characterIds);
          }
        }
      }

      Logger.log(ResponseMessages.MOVIE_SYNC_SUCCESS, 'SyncService');
    } catch (error) {
      this.isSyncRunning = false;
      Logger.error(error, 'SyncService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_SYNC_ERROR);
    }
  }
}

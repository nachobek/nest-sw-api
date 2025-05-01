import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { SwApiService } from 'src/external-apis/services/sw-api.service';
import { CreateMovieDto } from 'src/movies/dtos/create-movie.dto';
import { Source } from 'src/movies/enum/source.enum';
import { MoviesService } from 'src/movies/services/movies.service';

@Injectable()
export class SyncService {
  private isSyncRunning = false;

  constructor(
    private readonly swApiService: SwApiService,
    private readonly movieService: MoviesService,
  ) {}

  async syncMovies() {
    if (this.isSyncRunning) {
      throw new BadRequestException(ResponseMessages.SYNC_ALREADY_RUNNING);
    }

    this.isSyncRunning = true;

    try {
      await this.movieService.forceDeleteAllSwApiMovies();

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
            source: Source.SWAPI,
          };

          moviesToCreate.push(movie);
        }

        await this.movieService.createMany(moviesToCreate);
      }

      this.isSyncRunning = false;

      return ResponseMessages.MOVIE_SYNC_SUCCESS;
    } catch (error) {
      this.isSyncRunning = false;
      throw new InternalServerErrorException(ResponseMessages.MOVIE_SYNC_ERROR);
    }
  }
}

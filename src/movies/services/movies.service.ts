import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { Source } from '../enum/source.enum';
import { Movie } from '../models/movie.model';

export class MoviesService {
  constructor(
    @InjectModel(Movie)
    private movieModel: typeof Movie,
  ) {}

  async findAllMoviesPaginated(query: PaginationParams) {
    const { rows: data, count } = await this.movieModel.findAndCountAll(query);

    return {
      data,
      pagination: {
        page: query.offset,
        pageSize: query.limit,
        pageCount: Math.ceil(count / query.limit),
        total: count,
      },
    };
  }

  async findOneByPk(id: string) {
    const movie = await this.movieModel.findByPk(id);

    if (!movie) {
      throw new NotFoundException(ResponseMessages.MOVIE_NOT_FOUND);
    }

    return movie;
  }

  async create(movie: Partial<Movie | CreateMovieDto>) {
    try {
      return await this.movieModel.create(movie);
    } catch (error) {
      Logger.error(error, 'MoviesService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_CREATION_ERROR);
    }
  }

  async createMany(movies: Partial<Movie | CreateMovieDto>[]) {
    try {
      return await this.movieModel.bulkCreate(movies);
    } catch (error) {
      Logger.error(error, 'MoviesService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_CREATION_ERROR);
    }
  }

  async updateByPk(id: string, data: UpdateMovieDto) {
    const movie = await this.findOneByPk(id);

    try {
      return await movie.update(data);
    } catch (error) {
      Logger.error(error, 'MoviesService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_UPDATE_ERROR);
    }
  }

  async deleteByPk(id: string) {
    const movie = await this.findOneByPk(id);

    try {
      await movie.destroy();
    } catch (error) {
      Logger.error(error, 'MoviesService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_DELETION_ERROR);
    }

    return;
  }

  async forceDeleteAllSwApiMovies() {
    try {
      await this.movieModel.destroy({
        where: { source: Source.SWAPI },
        force: true,
      });
    } catch (error) {
      Logger.error(error, 'MoviesService');
      throw new InternalServerErrorException(ResponseMessages.MOVIE_DELETION_ERROR);
    }

    return;
  }
}

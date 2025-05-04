import {
  BadRequestException,
  forwardRef,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op } from 'sequelize';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { Source } from '../enum/source.enum';
import { Movie } from '../models/movie.model';
import { CharactersService } from './characters.service';

export class MoviesService {
  constructor(
    @Inject(forwardRef(() => CharactersService))
    private readonly characterService: CharactersService,
    @InjectModel(Movie)
    private movieModel: typeof Movie,
  ) {}

  async findAll(options?: FindOptions) {
    return this.movieModel.findAll(options);
  }

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
    const movie = await this.movieModel.findByPk(id, {
      include: [
        {
          association: 'characters',
          through: { attributes: [] },
        },
      ],
    });

    if (!movie) {
      throw new NotFoundException(ResponseMessages.MOVIE_NOT_FOUND);
    }

    return movie;
  }

  async create(movieData: Partial<CreateMovieDto>) {
    const uniqueCharacterIds = [...new Set(movieData.characters)];

    if (uniqueCharacterIds.length) {
      const characters = await this.characterService.findAll({
        where: { id: { [Op.in]: uniqueCharacterIds } },
      });

      if (characters.length !== uniqueCharacterIds.length) {
        throw new BadRequestException(ResponseMessages.CHARACTER_NOT_FOUND);
      }
    }

    const transaction = await this.movieModel.sequelize.transaction();

    try {
      const movie = await this.movieModel.create(movieData, { transaction });

      if (movieData.characters?.length) {
        await movie.setCharacters(uniqueCharacterIds, { transaction });
      }

      await transaction.commit();

      return movie;
    } catch (error) {
      await transaction.rollback();
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

    const uniqueCharacterIds = data.characters ? [...new Set(data.characters)] : undefined;

    // delete data.characters;

    if (uniqueCharacterIds?.length) {
      const characters = await this.characterService.findAll({
        where: { id: { [Op.in]: uniqueCharacterIds } },
      });

      if (characters.length !== uniqueCharacterIds.length) {
        throw new BadRequestException(ResponseMessages.CHARACTER_NOT_FOUND);
      }
    }

    const transaction = await this.movieModel.sequelize.transaction();

    try {
      if (uniqueCharacterIds) {
        await movie.setCharacters([], { force: true, transaction });
      }

      await movie.update(data, { transaction });

      if (uniqueCharacterIds?.length) {
        await movie.setCharacters(uniqueCharacterIds, { transaction });
      }

      await transaction.commit();

      return movie;
    } catch (error) {
      await transaction.rollback();
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

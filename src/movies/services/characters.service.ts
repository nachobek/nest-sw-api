import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, FindOptions, Op } from 'sequelize';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { BulkCreateCharactersDto } from '../dtos/bulk-create-characters.dto';
import { Source } from '../enum/source.enum';
import { Character } from '../models/character.model';
import { MoviesService } from './movies.service';

@Injectable()
export class CharactersService {
  constructor(
    @InjectModel(Character)
    private characterModel: typeof Character,
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService,
  ) {}

  async findAll(options?: FindOptions) {
    return this.characterModel.findAll(options);
  }

  async findAllCharactersPaginated(paginationParams: PaginationParams) {
    const { rows: data, count } = await this.characterModel.findAndCountAll(paginationParams);

    return {
      data,
      pagination: {
        page: paginationParams.offset,
        pageSize: paginationParams.limit,
        pageCount: Math.ceil(count / paginationParams.limit),
        total: count,
      },
    };
  }

  async findOneByPk(id: string) {
    const character = await this.characterModel.findByPk(id);

    if (!character) {
      throw new NotFoundException(ResponseMessages.CHARACTER_NOT_FOUND);
    }

    return character;
  }

  async createMany(bulkCreateCharactersDto: BulkCreateCharactersDto) {
    const uniqueMovieIds = [...new Set(bulkCreateCharactersDto.movies)];

    if (uniqueMovieIds.length) {
      const movies = await this.moviesService.findAll({
        where: {
          id: {
            [Op.in]: uniqueMovieIds,
          },
        },
      });

      if (movies.length !== uniqueMovieIds.length) {
        throw new BadRequestException(ResponseMessages.MOVIE_NOT_FOUND);
      }
    }

    const transaction = await this.characterModel.sequelize.transaction();

    try {
      const characters = await this.characterModel.bulkCreate(
        bulkCreateCharactersDto.characters as unknown as CreationAttributes<Character>[],
        { transaction },
      );

      if (bulkCreateCharactersDto.movies?.length) {
        for (const character of characters) {
          character.setMovies(uniqueMovieIds, { transaction });
        }
      }

      await transaction.commit();

      return characters;
    } catch (error) {
      await transaction.rollback();
      Logger.error(error, 'CharactersService');
      throw new InternalServerErrorException(ResponseMessages.CHARACTER_CREATION_ERROR);
    }
  }

  async deleteByPk(id: string) {
    const character = await this.findOneByPk(id);

    try {
      await character.destroy();
    } catch (error) {
      Logger.error(error, 'CharactersService');
      throw new InternalServerErrorException(ResponseMessages.CHARACTER_DELETION_ERROR);
    }

    return;
  }

  async forceDeleteAllSwApiCharacters() {
    try {
      await this.characterModel.destroy({ where: { source: Source.SWAPI }, force: true });
    } catch (error) {
      Logger.error(error, 'CharactersService');
      throw new InternalServerErrorException(ResponseMessages.CHARACTER_DELETION_ERROR);
    }
  }
}

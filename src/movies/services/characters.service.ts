import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { CreateCharacterDto } from '../dtos/create-character.dto';
import { Source } from '../enum/source.enum';
import { Character } from '../models/character.model';

@Injectable()
export class CharactersService {
  constructor(
    @InjectModel(Character)
    private characterModel: typeof Character,
  ) {}

  async findAll(options?: FindOptions) {
    return this.characterModel.findAll( options );
  }

  async createMany(characters: Partial<Character | CreateCharacterDto>[]) {
    try {
      return this.characterModel.bulkCreate(characters);
    } catch (error) {
      Logger.error(error, 'CharactersService');
      throw new InternalServerErrorException(ResponseMessages.CHARACTER_CREATION_ERROR);
    }
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

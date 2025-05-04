import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import { ApiStandardResponseDecorator } from 'src/common/decorators/api-standard-response.decorator';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import Role from 'src/common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { BulkCreateCharactersDto } from '../dtos/bulk-create-characters.dto';
import { Source } from '../enum/source.enum';
import { Character } from '../models/character.model';
import { CharactersService } from '../services/characters.service';

@Controller('characters')
@ApiTags('characters')
@ApiBearerAuth()
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns all characters paginated.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: Character,
    isArray: true,
  })
  async findAll(@Query() paginationParams: PaginationParams) {
    return await this.charactersService.findAllCharactersPaginated(paginationParams);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns a character by ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: Character,
  })
  async findOne(@Param('id') id: string) {
    const data = await this.charactersService.findOneByPk(id);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description:
      'Creates new movie characters. If you want to create characters for a specific movie(s), you can pass the movie id(s) in the movies array. Else, leave it empty and associate the charaters when creating the movie.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.CREATED,
    data: Character,
    isArray: true,
  })
  async createMany(@Body() bulkCreateCharactersDto: BulkCreateCharactersDto) {
    for (const createCharacterDto of bulkCreateCharactersDto.characters) {
      createCharacterDto.source = Source.INTERNAL;
    }

    const data = await this.charactersService.createMany(bulkCreateCharactersDto);

    return {
      statusCode: HttpStatus.CREATED,
      data,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Deletes a character by ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    message: ResponseMessages.ENTITY_REMOVED,
  })
  async delete(@Param('id') id: string) {
    await this.charactersService.deleteByPk(id);

    return {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.ENTITY_REMOVED,
    };
  }
}

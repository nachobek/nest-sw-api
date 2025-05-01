import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import { ApiStandardResponseDecorator } from 'src/common/decorators/api-standard-response.decorator';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import Role from 'src/common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { Source } from '../enum/source.enum';
import { Movie } from '../models/movie.model';
import { MoviesService } from '../services/movies.service';

@Controller('movies')
@ApiTags('movies')
@ApiBearerAuth()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: '[Admin, User]',
    description: 'Returns all movies paginated.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: Movie,
    isArray: true,
  })
  async findAll(@Query() paginationParams: PaginationParams) {
    return await this.moviesService.findAllMoviesPaginated(paginationParams);
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({
    summary: '[User]',
    description: 'Returns a movie by ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: Movie,
  })
  async findOne(@Param('id') id: string) {
    const data = await this.moviesService.findOneByPk(id);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Creates a new movie.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.CREATED,
    data: Movie,
  })
  async create(@Body() createMovieDto: CreateMovieDto) {
    createMovieDto.source = Source.INTERNAL;
    const data = await this.moviesService.create(createMovieDto);

    return {
      statusCode: HttpStatus.CREATED,
      data,
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Updates a movie by ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: Movie,
  })
  async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    const data = await this.moviesService.updateByPk(id, updateMovieDto);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Deletes a movie by ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    message: ResponseMessages.ENTITY_REMOVED,
  })
  async delete(@Param('id') id: string) {
    await this.moviesService.deleteByPk(id);

    return {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.ENTITY_REMOVED,
    };
  }
}

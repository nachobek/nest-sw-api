import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
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
  @ApiOkResponse({ type: [Movie] })
  async findAll(@Query() paginationParams: PaginationParams) {
    return await this.moviesService.findAllMoviesPaginated(paginationParams);
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({
    summary: '[User]',
    description: 'Returns a movie by ID.',
  })
  @ApiOkResponse({ type: Movie })
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOneByPk(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Creates a new movie.',
  })
  @ApiOkResponse({ type: Movie })
  async create(@Body() createMovieDto: CreateMovieDto) {
    createMovieDto.source = Source.INTERNAL;
    return await this.moviesService.create(createMovieDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Updates a movie by ID.',
  })
  @ApiOkResponse({ type: Movie })
  async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return await this.moviesService.updateByPk(id, updateMovieDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[Admin]',
    description: 'Deletes a movie by ID.',
  })
  @ApiOkResponse()
  async delete(@Param('id') id: string) {
    return await this.moviesService.deleteByPk(id);
  }
}

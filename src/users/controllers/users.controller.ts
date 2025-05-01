import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import { ApiStandardResponseDecorator } from 'src/common/decorators/api-standard-response.decorator';
import { GetJwtUser } from 'src/common/decorators/get-jwt-user.decorator';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import Role from 'src/common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from '../dtos/update-me.dto';
import { User } from '../models/user.model';
import { UsersService } from '../services/users.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns all users paginated.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: User,
    isArray: true,
  })
  async findAll(@Query() paginationParams: PaginationParams) {
    return await this.usersService.findAllUsersPaginated(paginationParams);
  }

  @Patch('me')
  @Roles(Role.USER)
  @ApiOperation({
    summary: '[Admin, User]',
    description: 'Performs an update of the authenticated user data.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: User,
  })
  async updateMe(@GetJwtUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(user, updateUserDto);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Delete('me')
  @Roles(Role.USER)
  @ApiOperation({
    summary: '[Admin, User]',
    description: 'Deletes the logged User record.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    message: ResponseMessages.ENTITY_REMOVED,
  })
  async removeMe(@GetJwtUser() user: User) {
    await this.usersService.removeMe(user);

    return {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.ENTITY_REMOVED,
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns a user by its ID.',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    data: User,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findOneByPk(id);

    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }
}

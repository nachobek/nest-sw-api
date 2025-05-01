import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
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
  @ApiOkResponse({ type: [User] })
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns all users paginated.',
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
  @ApiOkResponse({ type: User })
  async updateMe(@GetJwtUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(user, updateUserDto);
  }

  @Delete('me')
  @Roles(Role.USER)
  @ApiOperation({
    summary: '[Admin, User]',
    description: 'Deletes the logged User record.',
  })
  @ApiOkResponse()
  async removeMe(@GetJwtUser() user: User) {
    return await this.usersService.removeMe(user);
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  @ApiOperation({
    summary: '[Admin]',
    description: 'Returns a user by its ID.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneByPk(id);

    if (!user) {
      throw new NotFoundException(ResponseMessages.ENTITY_NOT_FOUND);
    }

    return user;
  }
}

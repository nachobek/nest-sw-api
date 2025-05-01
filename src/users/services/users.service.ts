import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { hash } from 'bcrypt';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { UpdateUserDto } from '../dtos/update-me.dto';
import { User } from '../models/user.model';

@Injectable()
export class UsersService {
  private hashingRounds = Number(process.env.HASHING_ROUNDS) || 10;

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async createUser(userData: SignUpDto): Promise<User> {
    try {
      userData.password = await hash(userData.password, this.hashingRounds);

      return await this.userModel.create({ ...userData });
    } catch (error) {
      Logger.error(error, 'UsersService');
      throw new InternalServerErrorException(ResponseMessages.ERROR_CREATING_USER);
    }
  }

  async findAllUsersPaginated(query: PaginationParams) {
    const { rows: data, count } = await this.userModel.findAndCountAll(query);

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

  async findOneByPk(id: number) {
    return await this.userModel.findByPk(id);
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ where: { email } });
  }

  async update(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await hash(updateUserDto.password, this.hashingRounds);
      }

      return await user.update({ updateUserDto });
    } catch (error) {
      Logger.error(error, 'UsersService');
      throw new InternalServerErrorException(ResponseMessages.ERROR_UPDATING_USER);
    }
  }

  async removeUserByPk(id: number) {
    try {
      await this.userModel.destroy({ where: { id } });
      return;
    } catch (error) {
      Logger.error(error, 'UsersService');
      throw new InternalServerErrorException(ResponseMessages.ERROR_REMOVING_USER);
    }
  }

  async removeMe(user: User) {
    return await this.removeUserByPk(user.id);
  }
}

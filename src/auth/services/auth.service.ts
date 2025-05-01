import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import { UsersService } from 'src/users/services/users.service';
import { AccessTokenDto } from '../dto/access-token.dto';
import { SignUpDto } from '../dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<AccessTokenDto> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException(ResponseMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ResponseMessages.INVALID_CREDENTIALS);
    }

    const accessTokenDto: AccessTokenDto = {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };

    return accessTokenDto;
  }

  async signUp(signUpDto: SignUpDto): Promise<AccessTokenDto> {
    const { email, password } = signUpDto;

    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException(ResponseMessages.EMAIL_ALREADY_TAKEN);
    }

    await this.usersService.createUser(signUpDto);

    return await this.signIn(email, password);
  }
}

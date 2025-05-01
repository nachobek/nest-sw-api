import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AccessTokenDto } from '../dto/access-token.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @Public()
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiOperation({ description: 'Public endpoint for Users to sign in.' })
  login(@Body() { email, password }: SignInDto) {
    return this.authService.signIn(email, password);
  }

  @Post('sign-up')
  @Public()
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiOperation({
    description:
      'Public endpoint for Users to sign up. If no errors occur, the service returns an access token.',
  })
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }
}

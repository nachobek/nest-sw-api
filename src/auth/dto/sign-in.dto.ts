import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SignUpDto } from './sign-up.dto';

export class SignInDto extends PickType(SignUpDto, ['email'] as const) {
  @ApiProperty({
    description: 'Password',
    name: 'password',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

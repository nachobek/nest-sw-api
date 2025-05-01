import { ApiProperty, PickType } from '@nestjs/swagger';
import { SignUpDto } from './sign-up.dto';
import { IsNotEmpty, IsString } from 'class-validator';

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

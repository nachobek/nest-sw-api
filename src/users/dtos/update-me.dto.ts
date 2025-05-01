import { PartialType, PickType } from '@nestjs/swagger';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

export class UpdateUserDto extends PartialType(
  PickType(SignUpDto, ['firstName', 'lastName', 'password'] as const),
) {}

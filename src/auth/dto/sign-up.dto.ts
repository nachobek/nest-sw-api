import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import Role from 'src/common/enums/role.enum';

export class SignUpDto {
  @ApiProperty({
    description: 'Role',
    name: 'role',
    required: true,
    type: String,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'First name',
    name: 'firstName',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    name: 'lastName',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Email',
    name: 'email',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    name: 'password',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

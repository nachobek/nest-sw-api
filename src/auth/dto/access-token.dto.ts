import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    description: 'Access token',
    name: 'accessToken',
    required: true,
    type: String,
  })
  accessToken: string;
}

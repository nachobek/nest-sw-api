import { ApiProperty } from '@nestjs/swagger';

export class ApiStandardResponse<T> {
  @ApiProperty({
    description: 'The status code of the response',
    required: false,
  })
  status?: number;

  @ApiProperty({
    description: 'The message of the response',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'The data of the response',
    required: false,
  })
  data?: T;
}

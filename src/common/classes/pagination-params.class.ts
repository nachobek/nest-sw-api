import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PaginationParams {
  @ApiProperty({
    description: 'Page number.',
    name: 'page',
    default: 1,
    required: true,
    type: Number,
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  private page: number;

  @ApiProperty({
    description: 'Page size limit.',
    name: 'pageSize',
    default: 20,
    required: true,
    type: Number,
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  private pageSize: number;

  get offset() {
    return this.page;
  }

  get limit() {
    return this.pageSize;
  }
}

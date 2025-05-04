import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Source } from '../enum/source.enum';

export class CreateCharacterDto {
  @ApiProperty({
    description: 'The name of the character',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The height of the character',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  height: number;

  @ApiProperty({
    description: 'The mass of the character',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  mass: number;

  @ApiProperty({
    description: 'The hair color of the character',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  hair_color: string;

  @ApiProperty({
    description: 'The skin color of the character',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  skin_color: string;

  @ApiProperty({
    description: 'The eye color of the character',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  eye_color: string;

  @ApiProperty({
    description: 'The birth year of the character',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  birth_year: string;

  @ApiProperty({
    description: 'The gender of the character',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiHideProperty()
  @IsEmpty()
  url: string;

  @ApiHideProperty()
  @IsEmpty()
  source: Source;

  @ApiProperty({
    description: 'The movie ids of the character',
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  movies?: number[];
}

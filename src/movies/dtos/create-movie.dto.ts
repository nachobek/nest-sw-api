import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Source } from '../enum/source.enum';
import { CreateCharacterDto } from './create-character.dto';

export class CreateMovieDto {
  @ApiProperty({
    description: 'The title of the movie',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    required: false,
    description: 'The episode number of the movie',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  episodeId?: number;

  @ApiProperty({
    description: 'The story line of the movie',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  storyLine?: string;

  @ApiProperty({
    description: 'The opening crawl of the movie',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  openingCrawl?: string;

  @ApiProperty({
    description: 'The director of the movie',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  director?: string;

  @ApiProperty({
    description: 'The producer of the movie',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  producer?: string;

  @ApiProperty({
    description: 'The release date of the movie. Date in format YYYY-MM-DD',
    required: false,
    example: new Date().toISOString().split('T')[0],
    type: String,
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  releaseDate?: Date;

  @ApiHideProperty()
  @IsEmpty()
  url: string;

  @ApiHideProperty()
  @IsEmpty()
  source: Source;

  @ApiProperty({
    description: 'The characters of the movie',
    required: false,
    type: [CreateCharacterDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterDto)
  @IsOptional()
  characters?: CreateCharacterDto[];
}

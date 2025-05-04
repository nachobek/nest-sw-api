import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

export class BulkCreateCharacterDto extends OmitType(CreateCharacterDto, ['movies'] as const) {
  @ApiHideProperty()
  @IsEmpty()
  movies?: number[];
}

export class BulkCreateCharactersDto {
  @ApiProperty({
    description:
      'The movie ids of the characters being created. All characters will be associated with these movies. Leave empty if you want to create the movie later and associate the characters to it.',
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  movies?: number[];

  @ApiProperty({
    description: 'The characters to create',
    required: true,
    type: [BulkCreateCharacterDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateCharacterDto)
  characters: BulkCreateCharacterDto[];
}

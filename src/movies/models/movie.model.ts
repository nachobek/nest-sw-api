import { ApiHideProperty } from '@nestjs/swagger';
import { BelongsToManySetAssociationsMixin } from 'sequelize';
import { BeforeDestroy, BelongsToMany, Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/common/models/base.model';
import { Source } from '../enum/source.enum';
import { CharacterMovie } from './character-movie.model';
import { Character } from './character.model';

@Table
export class Movie extends BaseModel {
  @Column({ allowNull: false, type: DataType.STRING })
  @Index({ unique: false })
  title: string;

  @Column({ type: DataType.INTEGER })
  episodeId: number;

  @Column({ type: DataType.TEXT })
  storyLine: string;

  @Column({ type: DataType.TEXT })
  openingCrawl: string;

  @Column({ type: DataType.STRING })
  director: string;

  @Column({ type: DataType.STRING })
  producer: string;

  @Column({ type: DataType.DATEONLY })
  releaseDate: Date;

  @ApiHideProperty()
  @BelongsToMany(() => Character, () => CharacterMovie, 'movieId', 'characterId')
  characters: Character[];

  @Column({ type: DataType.STRING })
  @Index({ unique: true })
  url: string;

  @Column({ allowNull: false, type: DataType.ENUM(...Object.values(Source)) })
  source: Source;

  @ApiHideProperty()
  declare setCharacters: BelongsToManySetAssociationsMixin<Character, Character['id']>;

  @BeforeDestroy
  static async cascadeDeleteMovie(movie: Movie) {
    await CharacterMovie.destroy({ where: { movieId: movie.id } });
  }
}

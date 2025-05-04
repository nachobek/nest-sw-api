import { ApiHideProperty } from '@nestjs/swagger';
import { BelongsToManySetAssociationsMixin } from 'sequelize';
import { BeforeDestroy, BelongsToMany, Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/common/models/base.model';
import { Source } from '../enum/source.enum';
import { CharacterMovie } from './character-movie.model';
import { Movie } from './movie.model';

@Table
export class Character extends BaseModel {
  @Column({ allowNull: false, type: DataType.STRING })
  @Index({ unique: false })
  name: string;

  @Column({ type: DataType.INTEGER })
  height: number;

  @Column({ type: DataType.INTEGER })
  mass: number;

  @Column({ type: DataType.STRING })
  hair_color: string;

  @Column({ type: DataType.STRING })
  skin_color: string;

  @Column({ type: DataType.STRING })
  eye_color: string;

  @Column({ type: DataType.STRING })
  birth_year: string;

  @Column({ type: DataType.STRING })
  gender: string;

  @ApiHideProperty()
  @BelongsToMany(() => Movie, () => CharacterMovie, 'characterId', 'movieId')
  movies: Movie[];

  @Column({ type: DataType.STRING })
  @Index({ unique: true })
  url: string;

  @Column({ allowNull: false, type: DataType.ENUM(...Object.values(Source)) })
  source: Source;

  @ApiHideProperty()
  declare setMovies: BelongsToManySetAssociationsMixin<Movie, Movie['id']>;

  @BeforeDestroy
  static async cascadeDeleteMovie(character: Character) {
    await CharacterMovie.destroy({ where: { characterId: character.id } });
  }
}

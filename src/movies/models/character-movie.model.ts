import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/common/models/base.model';
import { Character } from './character.model';
import { Movie } from './movie.model';

@Table
export class CharacterMovie extends BaseModel {
  @Column({ type: DataType.INTEGER })
  @ForeignKey(() => Character)
  characterId: number;

  @Column({ type: DataType.INTEGER })
  @ForeignKey(() => Movie)
  movieId: number;
}

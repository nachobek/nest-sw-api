import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/common/models/base.model';
import { Source } from '../enum/source.enum';

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

  @Column({ allowNull: false, type: DataType.ENUM(...Object.values(Source)) })
  source: Source;
}

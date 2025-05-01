import { ApiHideProperty } from '@nestjs/swagger';
import { Sequelize } from 'sequelize';
import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  PrimaryKey,
  UpdatedAt,
} from 'sequelize-typescript';

export class BaseModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column({ allowNull: false, type: DataType.INTEGER })
  id: number;

  @ApiHideProperty()
  @CreatedAt
  @Column({ allowNull: false, defaultValue: Sequelize.fn('NOW') })
  createdAt: Date;

  @ApiHideProperty()
  @UpdatedAt
  @Column({ allowNull: false, defaultValue: Sequelize.fn('NOW') })
  updatedAt: Date;

  @ApiHideProperty()
  @DeletedAt
  @Column
  deletedAt?: Date;
}

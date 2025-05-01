import { BaseModel } from 'src/common/models/base.model';
import { Table, Column, DataType, Index } from 'sequelize-typescript';
import Role from 'src/common/enums/role.enum';

@Table
export class User extends BaseModel {
  @Column({ type: DataType.ENUM(...Object.values(Role)) })
  role: Role;

  @Column({ allowNull: true, type: DataType.STRING })
  firstName: string;

  @Column({ allowNull: true, type: DataType.STRING })
  lastName: string;

  // @Column({
  //   type: DataType.VIRTUAL,
  //   get(this: User) {
  //     return `${this.firstName} ${this.lastName}`.trim();
  //   },
  // })
  // fullName: string;

  @Index({ unique: true })
  @Column({ allowNull: false, type: DataType.STRING })
  email: string;

  @Column({ allowNull: false, type: DataType.STRING })
  password: string;
}

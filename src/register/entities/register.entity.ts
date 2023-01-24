import {
  Table,
  Column,
  DataType,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({ tableName: 'register' })
export class Register extends Model<Register> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mobileno: string;
}

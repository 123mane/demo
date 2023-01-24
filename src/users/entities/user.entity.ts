import {
  Table,
  Column,
  DataType,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Register } from 'src/register/entities/register.entity';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    // set(walletAddress: string) {
    //   if (walletAddress != '') {
    //     this.setDataValue('walletAddress', walletAddress.toLowerCase());
    //   }
    // },
  })
  walletAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nonce: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  signature: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  networkId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deviceToken: string;

  
}

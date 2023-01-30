import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Permission } from '../../permission/entities/permission.entity';

@Table({ tableName: 'roles', timestamps: false })
export class Role extends Model<Role> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  permissionId: number;

  @BelongsTo(() => Permission)
  permissions: Permission;
}

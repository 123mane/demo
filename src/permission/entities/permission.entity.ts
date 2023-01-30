import { Column, DataType, Model, Table } from 'sequelize-typescript';
@Table({ tableName: 'permissions' })
export class Permission extends Model<Permission> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  permissions: string;
}

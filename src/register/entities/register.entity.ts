import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  Table,
  Column,
  DataType,
  Model,
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
    defaultValue: 5,
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
export class uploadImage {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  file: string;
}
export class UploadFolderDto {
  // @ApiProperty({
  //   required: true,
  //   type: 'string',
  //   enum: [
  //     'profile',
  //     'app',
  //     'static',
  //     'blog',
  //     'banner',
  //     'websiteLogo',
  //     'brandingLogo',
  //     'generalInformation',
  //     'contactus',
  //     'youtubeThumbnailImage',
  //     'attachment',
  //     'videoManagement',
  //     'galleryManagement',
  //   ],
  // })
  // @IsNotEmpty()
  // fileFor: string;
  // @ApiProperty({
  //   required: true,
  //   type: 'string',
  //   enum: ['audio', 'video', 'image', 'document'],
  // })
  // @IsNotEmpty()
  // fileType: string;
}

@Table({ tableName: 'multimedias' })
export class MultiMedia extends Model<MultiMedia> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'used',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalName: string;
}

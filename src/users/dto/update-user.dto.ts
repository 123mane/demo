// import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoleEnum } from 'src/helper/enum/roleEnum';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserRoleDto {
  @ApiProperty({ required: true, type: 'string', enum: RoleEnum })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value == 'admin') {
      return 1;
    } else if (value == 'subadmin') {
      return 2;
    }
  })
  roleId: string;
}

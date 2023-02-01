import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/helper/enum/roleEnum';

export class UserNonceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  lastName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  walletAddress: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nonce: string;
}
export class AdminAccountCreateDto extends CreateUserDto {
  @ApiProperty({ required: true, type: 'string', enum: RoleEnum })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value == 'admin') {
      return 2;
    } else if (value == 'subadmin') {
      return 3;
    }
  })
  roleId: string;
}

export class UserLoginDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  userName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

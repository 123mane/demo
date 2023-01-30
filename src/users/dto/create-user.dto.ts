import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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

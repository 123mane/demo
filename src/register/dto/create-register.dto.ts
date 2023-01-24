// import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  isEmail,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  minLength,
  MinLength,
} from 'class-validator';
export class CreateRegisterDto {
  //   @ApiProperty({ required: true })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  username: string;

  //   @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  //   @ApiProperty({ required: true })

  @IsNotEmpty()
  @IsEmail()
  email: string;

  //   @ApiProperty({ required: true })
  @IsNotEmpty()
  @MinLength(10)
  mobileno: string;
}

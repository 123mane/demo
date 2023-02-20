import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateRegisterDto {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @MinLength(10)
  mobileno: string;
}
export class CreateUploadDto {
  @ApiProperty({ required: true, type: 'file' })
  @IsOptional()
  file: string;
}
export class PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}
export class ReadWalletUserDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ type: 'string', required: false, enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortby: string;
}
export class EmailDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  username: string;
}

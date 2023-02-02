import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  walletAddress: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ type: 'string', required: false, enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortBy: string = 'DESC';
}

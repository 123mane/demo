import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class generateResetPasswordToken {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordTokenDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  token: string;
}

import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class AuthTokenDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsObject()
  @IsNotEmpty()
  roleId: object;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
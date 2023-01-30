import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  permissions: string;
}

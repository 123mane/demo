import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UserLoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePassword, passwordEncryption } from 'src/helper/utilis';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/auth.roles';
import { RoleEnum } from 'src/helper/enum/roleEnum';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  @ApiOperation({ description: 'This Api is used for admin login' })
  async login(@Body() loginDto: UserLoginDto, @Res() res: Response) {
    try {
      const isUserExists = await this.usersService.checkNameAndEmail(
        loginDto.userName,
      );
      if (!isUserExists) {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: false,

          data: null,
        });
      }
      let isPasswordValid = await comparePassword(
        loginDto.password,
        isUserExists.password,
      );
      if (!isPasswordValid) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,

          data: null,
        });
      }

      let token = await this.authService.generateToken({
        id: isUserExists.id,
        roleId: isUserExists.role,
        firstName: isUserExists.firstName,
        lastName: isUserExists.lastName,
        userName: isUserExists.userName,
        email: isUserExists.email,
      });
      return res.status(HttpStatus.OK).send({
        success: true,

        data: { token },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
  @Post('/send')
  async create(@Body() createUserDto: CreateUserDto) {
    createUserDto['password'] = await passwordEncryption(
      createUserDto.password,
    );

    return this.usersService.create(createUserDto);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    await this.usersService.delete(+id);
    return res.status(HttpStatus.OK).json({ Data: 'user data Deleted' });
  }
}

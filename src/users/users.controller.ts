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
  Put,
  Req,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UserLoginDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/update-user.dto';
import { comparePassword, passwordEncryption } from 'src/helper/utilis';
import {
  generateResetPasswordToken,
  ResetPasswordTokenDto,
} from './dto/generate-reset-password-token.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RoleGuard } from 'src/auth/guard/auth.roles';
import { RoleEnum } from 'src/helper/enum/roleEnum';
import { MailService } from 'src/mail/mail.service';
import { updateResetPassword } from './dto/update-reset.dto';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
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
      // console.log('pasword', isPasswordValid);
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
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @ApiOperation({
    description:
      'This api is used to delete the user only admin can access this route',
  })
  async remove(
    @Param('id') id: string,
    // @I18n() i18n: I18nContext,
    @Res() res: Response,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        await user.destroy();
        return res.status(HttpStatus.OK).send({
          success: true,

          message: 'User Deleted',
          data: null,
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: false,

          message: 'User Not Found',
          data: user,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @Put('/:id/update-role')
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @ApiOperation({
    description:
      'This api is used for update the permissions only admin can access this route',
  })
  async updateRolePermission(
    @Param('id') id: string,
    @Body() userupdatedto: UpdateUserRoleDto,
    @Res() res: Response,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        await this.usersService.update(user.id, userupdatedto);
        return res.status(HttpStatus.OK).send({
          success: true,
          // message: i18n.t('common.UPDATED_SUCCESSFULLY'),
          message: 'Update SuccessFully',
          data: null,
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: false,
          message: 'User Not Found ',
          // message: i18n.t('common.USER_NOT_FOUND'),
          data: user,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiOperation({
    description: 'This Api is used for generate token of reset password',
  })
  @Post('/generate-reset-password-token')
  async generateResetPasswordToken(
    @Res() res: Response,
    @Body() generateResetPasswordToken: generateResetPasswordToken,
  ) {
    try {
      const user = await this.usersService.findOne(generateResetPasswordToken);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: true,
          // message: i18n.t('common.EMAIL_NOT_FOUND'),
          message: 'Email Not Found',
          data: null,
        });
      }

      const resetPasswordToken =
        await this.authService.generateResetPasswordToken();
      await this.usersService.saveResetPasswordToken(
        user.id,
        resetPasswordToken,
      );
      // console.log(
      //   'email',
      //   generateResetPasswordToken.email,
      //   'and',
      //   'token',
      //   resetPasswordToken,
      // );

      await this.mailService.resetPassword(
        generateResetPasswordToken.email,
        resetPasswordToken,
      );
      return res.status(HttpStatus.OK).send({
        success: true,
        // message: i18n.t('common.EMAIL_RESET_PASSWORD_LINK'),
        message: 'Email_Reset_Password_Link',
        data: null,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
  @ApiOperation({
    description: 'This Api is used for verify reset password token',
  })
  @Get('/verify-reset-password-token')
  async verifyResetPasswordToken(
    @Req() req: any,
    @Query() tokenDto: ResetPasswordTokenDto,

    @Res() res: Response,
  ) {
    try {
      await this.authService.verifyResetPasswordToken(tokenDto.token);
      return res.status(HttpStatus.OK).send({
        success: true,
        // message: i18n.t('common.REST_TOKEN_VERIFIED'),
        message: 'Rsest_Token_Verified',
        data: null,
      });
    } catch (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      if (error.name === 'TokenExpiredError') {
        statusCode = HttpStatus.NOT_ACCEPTABLE;
      }
      return res.status(statusCode).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiOperation({ description: 'This Api is used for reset password' })
  @Post('/reset-password')
  async updateResetPassword(
    @Body() updateResetPasswordDto: updateResetPassword,
    @Res() res: Response,
  ) {
    const { password, token } = updateResetPasswordDto;
    try {
      const user = await this.usersService.resetTokenExists(token);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: false,
          message: 'Token_Does_not_Exist',
          data: null,
        });
      }
      await this.authService.verifyResetPasswordToken(token);
      let hashedPassword = await passwordEncryption(password);
      await this.usersService.updateResetPassword(hashedPassword, user.id);
      await this.usersService.deleteResetPassword(user.id);
      return res.status(HttpStatus.OK).send({
        success: true,
        message: 'Password_Changed',
        data: null,
      });
    } catch (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      if (error.name === 'TokenExpiredError') {
        statusCode = HttpStatus.NOT_ACCEPTABLE;
      }
      return res.status(statusCode).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
}

import { v4 as uuidv4 } from 'uuid';
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
import {
  AdminAccountCreateDto,
  CreateUserDto,
  UserLoginDto,
  UserNonceDto,
} from './dto/create-user.dto';
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
import { AuthModule } from 'src/auth/auth.module';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post('/admin/account-create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'this Api used for  admin panel to create account by admin',
  })
  async subcreate(
    @Res() res: Response,
    @Body() createUserDto: AdminAccountCreateDto,
  ) {
    try {
      let checkUserName = await this.usersService.findOne({
        userName: createUserDto.userName,
      });
      if (checkUserName) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Username Already Exist',
          data: null,
        });
      }
      let checkEmail = await this.usersService.findOne({
        email: createUserDto.email,
      });
      if (checkEmail) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          meassge: 'Email Already Exist',
          data: null,
        });
      }
      createUserDto['password'] = await passwordEncryption(
        createUserDto.password,
      );

      let user = await this.usersService.create(createUserDto);
      return res.status(HttpStatus.CREATED).send({
        success: true,
        message: 'User Create  SuccessFully',
        data: null,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.meassge,
        data: null,
      });
    }
  }
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

  @Post()
  @ApiOperation({ description: 'This api used for sub admin signup' })
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    try {
      let checkUserName = await this.usersService.findOne({
        userName: createUserDto.userName,
      });
      if (checkUserName) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Username Exist',
          data: null,
        });
      }
      let checkEmail = await this.usersService.findOne({
        email: createUserDto.email,
      });
      if (checkEmail) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Email Already Exist',
          data: null,
        });
      }
      createUserDto['password'] = await passwordEncryption(
        createUserDto.password,
      );
      createUserDto['roleId'] = 1;
      let user = await this.usersService.create(createUserDto);

      return res.status(HttpStatus.CREATED).send({
        success: true,
        message: 'User Created',
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get()
  async findAll(@Res() res: Response) {
    try {
      let userList = await this.usersService.findAll();
      return res.status(HttpStatus.OK).send({
        success: true,
        message: 'User List',
        data: userList,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        return res.status(HttpStatus.OK).send({
          success: false,
          message: 'User Found',
          data: user,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: error.meassge,
        data: null,
      });
    }
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      } else {
        let user = await this.usersService.update(+id, UpdateUserDto);
        return res.status(HttpStatus.OK).send({
          success: true,
          message: 'User Update data SuccesFully',
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
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @ApiOperation({
    description:
      'This api is used to delete the user only admin can access this route',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
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
          message: 'Update SuccessFully',
          data: null,
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          success: false,
          message: 'User Not Found ',
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

  @Post('/get-address-nonce')
  @ApiOperation({ description: 'This api used for generate nonce' })
  async getAddressNonce(@Res() res: Response, @Body() nonceDto: UserNonceDto) {
    try {
      let isUserExists = await this.usersService.findOne({
        walletAddress: nonceDto.walletAddress,
      });

      if (!isUserExists) {
        let params = {
          walletAddress: nonceDto.walletAddress,
          roleId: 1,
        };
        await this.usersService.metaMaskUserCreation(params);
      } else if (isUserExists.isBlocked === true) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,

          data: null,
        });
      }
      let nonce = uuidv4();
      let user = await this.usersService.findOne({
        walletAddress: nonceDto.walletAddress,
      });
      user.nonce = nonce;
      await user.save();
      return res.status(HttpStatus.OK).send({
        success: true,
        data: nonce,
        message: 'Nonce Generate SccesFully',
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

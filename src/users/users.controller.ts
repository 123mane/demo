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
import { Response, Request } from 'express';
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
import { UserDto } from './dto/user.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FastifyReply, FastifyRequest } from 'fastify';

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
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
    @Body() createUserDto: AdminAccountCreateDto,
  ) {
    try {
      let checkUserName = await this.usersService.findOne({
        userName: createUserDto.userName,
      });
      if (checkUserName) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USERNAME_EXIST'),
          data: null,
        });
      }
      let checkEmail = await this.usersService.findOne({
        email: createUserDto.email,
      });
      if (checkEmail) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          meassge: i18n.t('common.EMAIL_EXIST'),
          data: null,
        });
      }
      createUserDto['password'] = await passwordEncryption(
        createUserDto.password,
      );

      let user = await this.usersService.create(createUserDto);
      return res.code(HttpStatus.CREATED).send({
        success: true,
        message: i18n.t('common.USER_CREATED'),
        data: null,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.meassge,
        data: null,
      });
    }
  }
  @Post('/login')
  @ApiOperation({ description: 'This Api is used for admin login' })
  async login(
    @Body() loginDto: UserLoginDto,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      const isUserExists = await this.usersService.checkNameAndEmail(
        loginDto.userName,
      );

      if (!isUserExists) {
        return res.code(HttpStatus.NOT_FOUND).send({
          success: false,
          meaasge: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      }

      let isPasswordValid = await comparePassword(
        loginDto.password,
        isUserExists.password,
      );

      if (!isPasswordValid) {
        return res.code(HttpStatus.BAD_REQUEST).send({
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
      return res.code(HttpStatus.OK).send({
        success: true,
        data: { token },
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Post()
  @ApiOperation({ description: 'This api used for sub admin signup' })
  async create(
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      let checkUserName = await this.usersService.findOne({
        userName: createUserDto.userName,
      });
      if (checkUserName) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USERNAME_EXIST'),
          data: null,
        });
      }
      let checkEmail = await this.usersService.findOne({
        email: createUserDto.email,
      });
      if (checkEmail) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.EMAIL_EXIST'),
          data: null,
        });
      }
      createUserDto['password'] = await passwordEncryption(
        createUserDto.password,
      );
      createUserDto['roleId'] = 1;
      let user = await this.usersService.create(createUserDto);

      return res.code(HttpStatus.CREATED).send({
        success: true,
        message: i18n.t('common.USER_CREATED'),
        data: null,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/data')
  async findall(
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
    @Req() req: any,
  ) {
    try {
      let data = req.user;
      console.log('data', data);
      let walletAddress = req.user['userName'];
      console.log(walletAddress);
      let user = await this.usersService.findOne(walletAddress);
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.USER_DETAIL'),
        data: user,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('find')
  async find(
    @Query() query: UserDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      // let walletAddress = req.user['email'];
      // console.log(walletAddress);
      let user = await this.usersService.findOne(query);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      }
      return res.code(HttpStatus.OK).send({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get()
  async findAll(@Res() res: FastifyReply, @I18n() i18n: I18nContext) {
    try {
      let userList = await this.usersService.findAll();

      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.USER_LIST'),
        data: userList,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        return res.code(HttpStatus.OK).send({
          success: false,
          message: i18n.t('common.USER_DETAIL'),
          data: user,
        });
      } else {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: error.meassge,
        data: null,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard(RoleEnum.user))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      } else {
        UpdateUserDto['password'] = await passwordEncryption(
          UpdateUserDto.password,
        );
        let user = await this.usersService.update(+id, UpdateUserDto);
        return res.code(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.USER_UPDATED'),
          data: user,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
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
  async remove(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        await user.destroy();
        return res.code(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.USER_DELETED'),
          data: null,
        });
      } else {
        return res.code(HttpStatus.NOT_FOUND).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
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
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.usersService.findOne({ id: +id });
      if (user) {
        await this.usersService.update(user.id, userupdatedto);
        return res.code(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.ROLE_UPDATED'),
          data: null,
        });
      } else {
        return res.code(HttpStatus.NOT_FOUND).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: user,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Post('/get-address-nonce')
  @ApiOperation({ description: 'This api used for generate nonce' })
  async getAddressNonce(
    @Res() res: FastifyReply,
    @Body() nonceDto: UserNonceDto,
    @I18n() i18n: I18nContext,
  ) {
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
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_BLOCKED'),
          data: null,
        });
      }
      let nonce = uuidv4();
      let user = await this.usersService.findOne({
        walletAddress: nonceDto.walletAddress,
      });
      user.nonce = nonce;
      await user.save();
      return res.code(HttpStatus.OK).send({
        success: true,
        data: nonce,
        message: i18n.t('common.NONCE_GET"'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
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
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
    @Body() generateResetPasswordToken: generateResetPasswordToken,
  ) {
    try {
      const user = await this.usersService.findOne(generateResetPasswordToken);

      if (!user) {
        return res.code(HttpStatus.NOT_FOUND).send({
          success: true,
          message: i18n.t('common.EMAIL_NOT_FOUND'),
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
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.EMAIL_RESET_PASSWORD_LINK'),
        data: null,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
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
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      await this.authService.verifyResetPasswordToken(tokenDto.token);
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.REST_TOKEN_VERIFIED'),
        data: null,
      });
    } catch (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      if (error.name === 'TokenExpiredError') {
        statusCode = HttpStatus.NOT_ACCEPTABLE;
      }
      return res.code(statusCode).send({
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
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    const { password, token } = updateResetPasswordDto;
    try {
      const user = await this.usersService.resetTokenExists(token);
      if (!user) {
        return res.code(HttpStatus.NOT_FOUND).send({
          success: false,
          message: i18n.t('common.RESET_TOKEN_DOES_NOT_EXIST'),
          data: null,
        });
      }
      await this.authService.verifyResetPasswordToken(token);
      let hashedPassword = await passwordEncryption(password);
      await this.usersService.updateResetPassword(hashedPassword, user.id);
      await this.usersService.deleteResetPassword(user.id);
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.PASSWORD_CHANGED'),
        data: null,
      });
    } catch (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      if (error.name === 'TokenExpiredError') {
        statusCode = HttpStatus.NOT_ACCEPTABLE;
      }
      return res.code(statusCode).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
}

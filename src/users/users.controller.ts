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
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UserLoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePassword, passwordEncryption } from 'src/helper/utilis';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  // @Post('/')
  // // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('file', multerOptions))
  // async uploadcreate(
  //   @Query() query: UploadFolderDto,
  //   @Body() createUploadDto: CreateUploadDto,
  //   @UploadedFile() file: Express.Multer.File,
  //   @I18n() i18n: I18nContext,
  //   @Res() res: Response
  // ) {
  //   try {
  //     let params = {
  //       fileName: file['key'],
  //       fileType: query.fileType,
  //       fileFor: query.fileFor,
  //       status: 'used',
  //       originalName: file.originalname,
  //     };
  //     let multiMedia = await this.uploadService.create(params);
  //     let fullPath = `${basePath}${multiMedia.fileName}`;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: i18n.t('common.FILE_UPLOADED'),
  //       data: { fileName: fullPath },
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //       data: null,
  //     });
  //   }
  // }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   return file;
  // }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    await this.usersService.delete(+id);
    return res.status(HttpStatus.OK).json({ Data: 'user data Deleted' });
  }
}

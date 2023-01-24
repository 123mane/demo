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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { passwordEncryption } from 'src/helper/utilis';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/login')
  async login() {
    // this.usersService.login();
    return 'hello';
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

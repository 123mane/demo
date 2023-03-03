import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  HttpStatus,
  Req,
  Header,
} from '@nestjs/common';

import { RegisterService } from './register.service';
import {
  CreateRegisterDto,
  CreateUploadDto,
  EmailDto,
  ReadWalletUserDto,
} from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { passwordEncryption } from 'src/helper/utilis';
import { multerOptions } from '../helper/multer/index';
import { UploadFolderDto } from './entities/register.entity';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { arrayToCSV, convertCsvToArray } from 'src/helper/utilis/index.utilis';
import { join } from 'path';
import { csvFileUploadOptions } from 'src/helper/multer/csvUpload';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { FastifyReply } from 'fastify';
import { I18n, I18nContext } from 'nestjs-i18n';
@ApiTags('Register')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  async create(
    @Body() createRegisterDto: CreateRegisterDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.registerService.findOne({
        email: createRegisterDto.email,
      });
      if (user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.EMAIL_EXIST'),
          data: null,
          success: false,
        });
      }
      user = await this.registerService.findOne({
        username: createRegisterDto.username,
      });
      if (user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.USERNAME_EXIST'),
          data: null,
          success: false,
        });
      }
      createRegisterDto['password'] = await passwordEncryption(
        createRegisterDto.password,
      );
      user = await this.registerService.create(createRegisterDto);
      return res.code(HttpStatus.OK).send({
        success: false,
        message: i18n.t('common.USER_CREATED'),
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
  @Post('/image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFastifyInterceptor('file', multerOptions))
  uploadimage(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFolderDto,
    @Body() CreateUploadDto: CreateUploadDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let params = {
        originalName: file.originalname,
      };
      let data = this.registerService.uploadimage(params);
      return res.code(HttpStatus.OK).send({
        succes: true,
        message: i18n.t('common.FILE_UPLOADED'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: null,
        message: error.message,
      });
    }
  }

  @Patch(':id/image')
  @ApiConsumes()
  @UseInterceptors(FileFastifyInterceptor('file', multerOptions))
  async FindandUpdateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFolderDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let find = await this.registerService.findImage(+id);

      if (!find) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Image Not Found',
          data: null,
        });
      } else {
        return res.code(HttpStatus.OK).send({
          success: true,
          data: find,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: error.message,
      });
    }
  }

  @Get()
  async findAll(@Res() res: FastifyReply, @I18n() i18n: I18nContext) {
    try {
      let user = await this.registerService.findAll();
      // console.log('user:', typeof user);
      //  var data= arrayToCSV(user);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      } else {
        return res.code(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.USER_DETAIL'),
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
  @ApiOperation({ description: 'this api is used for nft meta data upload' })
  // @ApiBearerAuth()
  @Post('/metaData')
  // @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFastifyInterceptor('file', csvFileUploadOptions))
  async csvFileUpload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let basePathOfCsv = '../../upload';
      let filePath = join(__dirname, basePathOfCsv, file.filename);
      let data: any = convertCsvToArray(filePath);

      data = await this.registerService.createBulkCategory(data);
      return res.code(HttpStatus.CREATED).send({
        success: true,
        message: i18n.t('common.FILE_UPLOADED'),
        data: data,
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get('/dwonload')
  async downloadCsvfile(@Res() res: any, @I18n() i18n: I18nContext) {
    try {
      let user = await this.registerService.findAll();
      let data = arrayToCSV(user);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      } else {
        res.header('Content-disposition', 'attachment; filename=data.csv');
        res.code(HttpStatus.OK).send({ data: data });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      let user = await this.registerService.finddOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      } else {
        return res.code(HttpStatus.OK).send({
          success: true,
          data: user,
          message: i18n.t('common.USER_UPDATE'),
        });
      }
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, data: null, message: error.message });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRegisterDto: UpdateRegisterDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.registerService.findOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          data: null,
          message: i18n.t('common.USER_NOT_FOUND'),
        });
      } else {
        await this.registerService.update(+id, updateRegisterDto);
        return res.status(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.USER_UPDATE'),
        });
      }
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, data: null, message: error.message });
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.registerService.findOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.USER_NOT_FOUND'),
          data: null,
        });
      } else {
        await this.registerService.remove(+id);
        return res.code(HttpStatus.OK).send({
          success: true,
          message: i18n.t('common.USER_DELETED'),
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
  @Get('/filter')
  async Filter(
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
    @Query() query: ReadWalletUserDto,
  ) {
    try {
      let user = await this.registerService.filter(query);
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.DATA_SHOW_AND_COUNT'),
        data: user,
      });
    } catch (error) {
      console.log('error', error);
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get('/count')
  async findandcount(
    @Query() query: EmailDto,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      let data = await this.registerService.findAllandCount(
        query.email,
        query.username,
      );
      return res.code(HttpStatus.OK).send({
        success: true,
        data: data,
        message: i18n.t('common.DATA_SHOW_AND_COUNT'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: null,
        message: error.message,
      });
    }
  }

  @Get('/cou')
  async findAllwithredis(
    // @Query() query: EmailDto,
    // @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      let data = await this.registerService.findAlll();
      console.log('data:', data);
      return res.code(HttpStatus.OK).send({
        success: true,
        data: data,
        message: i18n.t('common.DATA_SHOW_AND_COUNT'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: null,
        message: error.message,
      });
    }
  }
  @Get('/cou/:id')
  async findAllwithredisid(
    // @Query() query: EmailDto,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      let data = await this.registerService.finddOne(+id);
      console.log('data:', data);
      return res.code(HttpStatus.OK).send({
        success: true,
        data: data,
        message: i18n.t('common.DATA_SHOW_AND_COUNT'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: null,
        message: error.message,
      });
    }
  }

  @Get('/data')
  async data(@Res() res: FastifyReply) {
    try {
      let dataa = await this.registerService.add();
      // console.log('data:', dataa);
      res.code(HttpStatus.OK).send({ data: dataa });
    } catch (error) {
      console.log('Error:', error);
    }
  }
}

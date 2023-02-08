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
  UploadedFiles,
  HttpStatus,
  Next,
  UseGuards,
  Req,
} from '@nestjs/common';
let csvToJson = require('convert-csv-to-json');
// import { CreateUploadDto } from './dto/uploadFloderDto';
import { RegisterService } from './register.service';
import { CreateRegisterDto, CreateUploadDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { passwordEncryption } from 'src/helper/utilis';
import { Response } from 'express';
import { multerOptions } from '../helper/multer/index';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadImage, UploadFolderDto } from './entities/register.entity';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { arrayToCSV, convertCsvToArray } from 'src/helper/utilis/index.utilis';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { csvFileUploadOptions } from 'src/helper/multer/csvUpload';
@ApiTags('Register')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  async create(
    @Body() createRegisterDto: CreateRegisterDto,
    @Res() res: Response,
  ) {
    try {
      let user = await this.registerService.findOne({
        email: createRegisterDto.email,
      });
      if (user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Email Already Exist',
          data: null,
          success: false,
        });
      }
      user = await this.registerService.findOne({
        username: createRegisterDto.username,
      });
      if (user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Username Already Exist',
          data: null,
          success: false,
        });
      }
      createRegisterDto['password'] = await passwordEncryption(
        createRegisterDto.password,
      );
      user = await this.registerService.create(createRegisterDto);
      return res.status(HttpStatus.OK).send({
        success: false,
        message: 'User Data Submitted',
        data: user,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
  @Post('/image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadimage(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFolderDto,
    @Body() CreateUploadDto: CreateUploadDto,
    @Res() res: Response,
  ) {
    try {
      let params = {
        originalName: file.originalname,
      };
      let data = this.registerService.uploadimage(params);
      return res.status(HttpStatus.OK).send({
        succes: true,
        message: 'File Uploaded SuccesFully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
      });
    }
  }

  @Patch(':id/image')
  @ApiConsumes()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async FindandUpdateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadFolderDto,
    @Res() res: Response,
  ) {
    try {
      let find = await this.registerService.findImage(+id);

      if (!find) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'Image Not Found',
          data: null,
        });
      } else {
        return res.status(HttpStatus.OK).send({
          success: true,
          data: find,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: error.message,
      });
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      let user = await this.registerService.findAll();
      //  var data= arrayToCSV(user);
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      } else {
        return res.status(HttpStatus.OK).send({
          success: true,
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
  @ApiOperation({ description: 'this api is used for nft meta data upload' })
  // @ApiBearerAuth()
  @Post('/metaData')
  // @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', csvFileUploadOptions))
  async csvFileUpload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
    @Res() res: Response,
  ) {
    try {
      let basePathOfCsv = '../../upload';
      let filePath = join(__dirname, basePathOfCsv, file.filename);
      let data: any = convertCsvToArray(filePath);
      console.log('data', data);
      data = await this.registerService.createBulkCategory(data);
      return res.status(HttpStatus.CREATED).send({
        success: true,
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get('/dwonload')
  async downloadCsvfile(@Res() res: Response) {
    try {
      let user = await this.registerService.findAll();
      let data = arrayToCSV(user);
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      } else {
        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        res.set('Content-Type', 'text/csv');
        res.status(HttpStatus.OK).send(data);
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      let user = await this.registerService.findOne(+id);
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      } else {
        return res.status(HttpStatus.OK).send({
          success: true,
          data: user,
        });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, data: null, message: error.message });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRegisterDto: UpdateRegisterDto,
    @Res() res: Response,
  ) {
    try {
      let user = await this.registerService.findOne(+id);
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          data: null,
          message: 'User Not Found',
        });
      } else {
        await this.registerService.update(+id, updateRegisterDto);
        return res.status(HttpStatus.OK).send({
          success: true,
          message: 'User Updated SuccessFully',
        });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, data: null, message: error.message });
    }
  }

  @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.registerService.remove(+id);
  // }
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      let user = await this.registerService.findOne(+id);
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: 'User Not Found',
          data: null,
        });
      } else {
        await this.registerService.remove(+id);
        return res.status(HttpStatus.OK).send({
          success: true,
          message: 'User Deleted SuccessFully ',
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
}

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
} from '@nestjs/common';
// import { CreateUploadDto } from './dto/uploadFloderDto';
import { RegisterService } from './register.service';
import { CreateRegisterDto, CreateUploadDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { passwordEncryption } from 'src/helper/utilis';
import { NextFunction, Request, Response } from 'express';
import { multerOptions } from '../helper/multer/index';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadImage, UploadFolderDto } from './entities/register.entity';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
@ApiTags('Register')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  async create(@Body() createRegisterDto: CreateRegisterDto) {
    createRegisterDto['password'] = await passwordEncryption(
      createRegisterDto.password,
    );
    return this.registerService.create(createRegisterDto);
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
    @Body() CreateUploadDto: CreateUploadDto,
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
          message: 'Updated SuccessFully Image',
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
  findAll() {
    return this.registerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegisterDto: UpdateRegisterDto,
  ) {
    return this.registerService.update(+id, updateRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registerService.remove(+id);
  }
}

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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { I18n, I18nContext } from 'nestjs-i18n';
@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let permission = await this.permissionService.create(createPermissionDto);
      return res.code(HttpStatus.OK).send({
        success: true,
        message: i18n.t('common.PERMISSION_CREATED'),
        data: permission,
      });
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, data: null, message: error.message });
    }
  }

  @Get()
  async findAll(@Res() res: FastifyReply, @I18n() i18n: I18nContext) {

    try {
      let permission = await this.permissionService.findAll();
      if (permission) {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.PERMISSION_LIST'),
          success: true,
          data: permission,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: error.message,
        success: false,
        data: null,
      });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      const user = await this.permissionService.findOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.PERMISSIN_NOT_FOUND'),
          success: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.PERMISSION_DETAIL'),
          success: true,
          data: user,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: error.message,
        success: false,
        data: null,
      });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      const user = await this.permissionService.update(
        +id,
        updatePermissionDto,
      );
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.PERMISSIN_NOT_FOUND'),
          success: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.PERMISSION_UPDATED'),
          success: true,
        });
      }
    } catch (error) {}
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.permissionService.findOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          success: false,
          message: i18n.t('common.PERMISSION_NOT_FOUND'),
          data: null,
        });
      } else {
        let data = await this.permissionService.remove(+id);
        return res.code(HttpStatus.CREATED).send({
          success: true,
          message: i18n.t('common.PERMISSION_DELETED'),
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
}

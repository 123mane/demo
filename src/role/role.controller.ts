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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.roleService.create(createRoleDto);
      return res.code(HttpStatus.CREATED).send({
        success: true,
        message: i18n.t('common.ROLE_CREATED'),
      });
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: null,
        message: error.message,
      });
    }
  }

  @Get()
  async findAll(@Res() res: FastifyReply, @I18n() i18n: I18nContext) {
    try {
      let user = await this.roleService.findAll();
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.USER_NOT_FOUND'),
          success: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.ROLE_LIST'),
          success: 'true',
          data: user,
        });
      }
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: error.message, success: false, data: null });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.roleService.findOne(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.ROLE_NOT_FOUND'),
          sucsess: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.ROLE_LIST'),
          success: true,
          data: user,
        });
      }
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: error.message, success: false, data: null });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @I18n() i18n: I18nContext,
    @Res() res: FastifyReply,
  ) {
    try {
      let user = await this.roleService.update(+id, updateRoleDto);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.USER_NOT_FOUND'),
          success: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.ROLE_UPDATE'),
          success: true,
          data: null,
        });
      }
    } catch (error) {
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: error.message, data: null, success: false });
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @I18n() i18n: I18nContext,
  ) {
    try {
      let user = await this.roleService.remove(+id);
      if (!user) {
        return res.code(HttpStatus.BAD_REQUEST).send({
          message: i18n.t('common.ROLE_NOT_FOUND'),
          success: false,
          data: null,
        });
      } else {
        return res.code(HttpStatus.CREATED).send({
          message: i18n.t('common.ROLE_DELETE'),
          success: true,
          data: user,
        });
      }
    } catch (error) {
      return res.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: error.message,
        data: null,
        success: false,
      });
    }
  }
}

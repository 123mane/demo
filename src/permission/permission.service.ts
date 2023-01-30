import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission) private readonly permissionRepo: typeof Permission,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    return await this.permissionRepo.create(createPermissionDto);
  }

  async findAll() {
    return await this.permissionRepo.findAll();
    // return `This action returns all permission`;
  }

  async findOne(id: number) {
    return await this.permissionRepo.findOne({ where: { id: id } });
    // return `This action returns a #${id} permission`;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    // return `This action updates a #${id} permission`;
    return await this.permissionRepo.update(updatePermissionDto, {
      where: { id: id },
    });
  }

  async remove(id: number) {
    // return `This action removes a #${id} permission`;
    return await this.permissionRepo.destroy({ where: { id: id } });
  }
}

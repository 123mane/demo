import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from 'src/permission/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role) private readonly Rolerepo: typeof Role) {}
  async create(createRoleDto: CreateRoleDto) {
    return await this.Rolerepo.create(createRoleDto);
  }

  async findAll() {
    return await this.Rolerepo.findAll({
      include: [{ model: Permission }],
    });
  }

  async findOne(id: number) {
    return await this.Rolerepo.findOne({ where: { id: id } });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.Rolerepo.update(updateRoleDto, { where: { id: id } });
  }

  remove(id: number) {
    return this.Rolerepo.destroy({ where: { id: id } });
  }
}

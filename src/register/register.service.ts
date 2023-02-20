import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from 'src/users/entities/user.entity';
import { CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { MultiMedia, Register } from './entities/register.entity';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(Register) private RegisterRepo: typeof Register,
    @InjectModel(MultiMedia) private MultiMeadiaRepository: typeof MultiMedia,
  ) {}

  async create(createRegisterDto: CreateRegisterDto) {
    return await this.RegisterRepo.create(createRegisterDto);
  }

  async uploadimage(params: any) {
    return await this.MultiMeadiaRepository.create(params);
  }

  async findImage(id: number) {
    return await this.MultiMeadiaRepository.findOne({ where: { id: id } });
  }
  async findAll() {
    return await this.RegisterRepo.findAndCountAll({
      include: [
        { model: User, attributes: ['firstName', 'LastName', 'walletAddress'] },
      ],
      raw: true,
      limit: 100,
    });
  }
  async createBulkCategory(data: any) {
    return await this.RegisterRepo.bulkCreate(data);
  }
  async filter(param: any): Promise<any> {
    let where = {};
    let sortby = 'DESC';
    if (param.sortby) {
      sortby = param.sortby;
    }
    if (param.username) {
      where['username'] = { [Op.like]: `${param.username}` };
    }
    if (param.email) {
      where['email'] = { [Op.like]: `${param.email}` };
    }
    if (param.search) {
      where[Op.or] = [
        { email: { [Op.like]: `${param.search}` } },
        { username: { [Op.like]: `${param.search}` } },
      ];
    }

    if (param.page && param.limit) {
      let page = param.page;
      let limit = param.limit;
      let skip = (page - 1) * limit;

      return await this.RegisterRepo.findAndCountAll({
        where,
        attributes: ['id', 'username', 'email'],
        include: [{ model: User }],
        offset: skip,
        limit,
      });
    } else {
      return await this.RegisterRepo.findAndCountAll({
        where,
        attributes: ['id', 'username', 'email'],
        raw: true,
        nest: true,
      });
    }
  }

  async findOne(param: any): Promise<Register> {
    let where = {};
    if (param.id) {
      where['id'] = param.id;
    }
    if (param.email) {
      where['email'] = param.email;
    }
    if (param.userName) {
      where['username'] = param.username;
    }
    return await this.RegisterRepo.findOne({
      where,
    });
  }

  async update(id: number, updateRegisterDto: UpdateRegisterDto) {
    return await this.RegisterRepo.update(updateRegisterDto, {
      where: { id: id },
    });
  }

  async remove(id: number) {
    return await this.RegisterRepo.destroy({ where: { id: id } });
  }
}

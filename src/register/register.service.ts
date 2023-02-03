import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';
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
    // console.log(params);
    return await this.MultiMeadiaRepository.create(params);
  }

  async findImage(id: number) {
    return await this.MultiMeadiaRepository.findOne({ where: { id: id } });
  }
  async findAll() {
    return await this.RegisterRepo.findAll({
      include: [
        { model: User, attributes: ['firstName', 'LastName', 'walletAddress'] },
      ],
      raw: true,
      // order: [['createdAt']],
    });
  }

  // async findOne(id: number) {
  //   return await this.RegisterRepo.findOne({ where: { id: id } });
  // }
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
    // return `This action updates a #${id} register`;
  }

  async remove(id: number) {
    return await this.RegisterRepo.destroy({ where: { id: id } });
    // return `This action removes a #${id} register`;
  }
}

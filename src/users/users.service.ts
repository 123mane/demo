import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Register } from 'src/register/entities/register.entity';
import { Role } from 'src/role/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async login(email: string, password: string) {
    await this.userRepository.findOne({ where: { email: email } });
  }

  async create(CreateUserDto: CreateUserDto) {
    return await this.userRepository.create(CreateUserDto);
  }
  // async checkNameAndEmail(userName: string) {
  //   return await this.userRepository.findOne({
  //     where: { [Op.or]: [{ userName: userName }, { email: userName }] },
  //     include: [{ model: Role }],
  //   });
  // }
   async checkNameAndEmail(userName: string) {
    return await this.userRepository.findOne({
      where: {
        [Op.or]: [
          {
            userName: userName,
          },
          {
            email: userName,
          },
        ],
      },
      include: [{ model: Role }],
    });
  }

  async findAll() {
    return await this.userRepository.findAll({
      include: [{ model: Register, attributes: ['username', 'password'] }],
    });
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(updateUserDto, {
      where: { id: id },
    });
  }

  async delete(id: number) {
    return await this.userRepository.destroy({ where: { id: id } });
  }
}

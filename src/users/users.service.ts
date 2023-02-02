import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Permission } from 'src/permission/entities/permission.entity';
import { Register } from 'src/register/entities/register.entity';
import { Role } from 'src/role/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async login(email: string, password: string) {
    await this.userRepository.findOne({ where: { email: email } });
  }
  async metaMaskUserCreation(params: any) {
    return await this.userRepository.create(params);
  }

  async create(CreateUserDto: CreateUserDto) {
    return await this.userRepository.create(CreateUserDto);
  }

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

  async findOne(param: any): Promise<User> {
    let where = {};
    if (param.id) {
      where['id'] = param.id;
    }
    if (param.email) {
      where['email'] = param.email;
    }
    if (param.walletAddress) {
      where['walletAddress'] = param.walletAddress;
    }
    if (param.userName) {
      where['userName'] = param.userName;
    }
    if (param.firstName) {
      where['firstName'] = param.firstName;
    }
    return await this.userRepository.findOne({
      where,
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
            },
          ],
        },
      ],
    });
  }

  async update(id: number, updateUserDto: any) {
    return await this.userRepository.update(updateUserDto, {
      where: { id: id },
    });
  }
  async saveResetPasswordToken(id: number, token: string) {
    return await this.userRepository.update(
      { resetPasswordToken: token },
      { where: { id } },
    );
  }
  async resetTokenExists(token: string) {
    return await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async updateResetPassword(password: string, id: number) {
    return await this.userRepository.update({ password }, { where: { id } });
  }
  async deleteResetPassword(id: number) {
    return await this.userRepository.update(
      { resetPasswordToken: '' },
      { where: { id } },
    );
  }
}

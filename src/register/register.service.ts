import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import { col, fn, Op } from 'sequelize';
import { User } from 'src/users/entities/user.entity';
import { CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { MultiMedia, Register } from './entities/register.entity';
import redis from 'ioredis';

let deflaut_Expression = 3600;
let redisclient = redis.createClient();
@Injectable()
export class RegisterService {
  constructor(
    private readonly httpService: HttpService,
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
        attributes: {
          exclude: ['password', 'mobileno', 'userId', 'createdAt', 'updatedAt'],
        },
        include: [{ model: User, attributes: ['id', 'username', 'email'] }],
        offset: skip,
        limit,
      });
    } else {
      return await this.RegisterRepo.findAndCountAll({
        where,
        attributes: {
          exclude: ['password', 'mobileno', 'userId', 'createdAt', 'updatedAt'],
        },
        raw: true,
        nest: true,
      });
    }
  }

  async findAllandCount(email: string, username: string) {
    email = email.toLowerCase();
    console.log('Email', email);
    let where = {};
    if (email) {
      where['email'] = email;
    }
    if (username) {
      where['username'] = username;
    }
    let data: any = await this.RegisterRepo.findAll({
      where,
      attributes: [
        'email',
        [fn('count', col('email')), 'quantity'],
        'username',
        [fn('count', col('username')), 'quantity'],
      ],
      group: ['username'],
    });
    return data;
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
  async finddOne(id: number) {
    return await this.RegisterRepo.findOne({ where: { id: id } });
  }

  async update(id: number, updateRegisterDto: UpdateRegisterDto) {
    return await this.RegisterRepo.update(updateRegisterDto, {
      where: { id: id },
    });
  }

  async remove(id: number) {
    return await this.RegisterRepo.destroy({ where: { id: id } });
  }
  // add redis using the mysql with redis
  async findAlll() {
    return await this.RegisterRepo.findAll();
  }

  async add() {
    let dataa = await redisclient.get('cou');
    let data = JSON.parse(dataa);
    if (data != null) {
      console.log('result:', data);
      console.log('Type:', typeof data);
      return data;
    } else {
      let { data } = await this.httpService.axiosRef.get(
        'http://localhost:3000/register/cou',
      );
      console.log('top:', typeof data);
      redisclient.setex('cou', deflaut_Expression, JSON.stringify(data));
      // console.log('Daatata:', data);
      return data;
    }
  }
}

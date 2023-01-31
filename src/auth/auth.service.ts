import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/entities/user.entity';
import { AuthTokenDto } from './dto/authtoken.dto';
import config from '../config/config';
const { secret, expiresIn } = config.resetPasswordConfig;
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
    private jwtService: JwtService,
  ) {}

  async generateToken(payload: AuthTokenDto) {
    return await this.jwtService.signAsync(payload);
  }
  async generateResetPasswordToken() {
    return await this.jwtService.signAsync({ secret }, { expiresIn });
  }

  async verifyResetPasswordToken(token: string) {
    console.log(token);
    return await this.jwtService.verify(token);
  }
  async getUserBasedOnToken(payload: any): Promise<User> {
    let where = {};
    if (payload.walletAddress) {
      where['walletAddress'] = payload.walletAddress;
    }
    if (payload.email) {
      where['email'] = payload.email;
    }
    return await this.userRepository.findOne({
      where,
      attributes: { exclude: ['password'] },
    });
  }
}

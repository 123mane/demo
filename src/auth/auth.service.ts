import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/entities/user.entity';
import { AuthTokenDto } from './dto/authtoken.dto';

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

  async verifyResetPasswordToken(token: string) {
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

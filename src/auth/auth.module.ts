import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import configuration from 'src/config/config';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

const { secret, expiresIn } = configuration.jwt;

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

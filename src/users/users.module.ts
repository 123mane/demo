import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

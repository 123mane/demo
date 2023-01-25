import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { MultiMedia, Register } from './entities/register.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Register, MultiMedia])],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}

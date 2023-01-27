import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { arrayOfModels } from './database/models/model';
import { UsersModule } from './users/users.module';
import { RegisterModule } from './register/register.module';
import config from './config/config';

const { db_host, db_name, db_password, db_port, db_username } =
  config.databaseConfig;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    SequelizeModule.forRoot({
      database: db_name,
      host: db_host,
      port: db_port,
      dialect: 'mysql',
      username: db_username,
      password: db_password,
      models: arrayOfModels,
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    RegisterModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}

import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { arrayOfModels } from './database/models/model';
import { UsersModule } from './users/users.module';
import { RegisterModule } from './register/register.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import config from './config/config';
import { MailModule } from './mail/mail.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
const redisStore = require('cache-manager-redis-store');
import { join } from 'path';

const { db_host, db_name, db_password, db_port, db_username } =
  config.databaseConfig;

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: join(__dirname, '/language/'), watch: true },
      resolvers: [
        {
          use: HeaderResolver,
          options: ['lang'],
        },
        AcceptLanguageResolver,
      ],
    }),
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
    MailModule,
    RegisterModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}

import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { normalizeValidationError } from './helper/utilis/expection.utils';
import { AppModule } from './app.module';
import * as hbs from 'express-handlebars';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Dummy')
    .setDescription('The Crud-Relation API description')
    .setVersion('1.0')

    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        if (errors.length > 0)
          throw new BadRequestException(normalizeValidationError(errors));
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('hbs', hbs({ extname: 'hbs' }));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();

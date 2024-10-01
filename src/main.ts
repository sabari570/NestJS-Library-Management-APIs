import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,);
  app.use(helmet());
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });


  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Strip properties that are not in the DTO
    forbidNonWhitelisted: false, // Throw an error for no-whitelisted properties,
    transform: true,  // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true  // The transformOptions with { enableImplicitConversion: true } is particularly important for handling transformations within DTOs.
    }
  }))
  const port = process.env.PORT || 3000;
  await app.listen(port).then(() => {
    Logger.log(`Server started at port ${port}`)
  });
}
bootstrap();
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';

let app: INestApplication;
const initApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
};

export const getApp = async () => {
  if (!app) {
    app = await initApp();
    await app.listen(0, 'localhost');
  }
  return app;
};

export const stopApp = async () => {
  await app.close();
};

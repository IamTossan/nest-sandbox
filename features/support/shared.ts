import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { setTimeout } from 'timers/promises';

let app: INestApplication;
const initApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  app.connectMicroservice<NatsOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  await app.startAllMicroservices();

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
  await setTimeout(500);
  await app.close();
};

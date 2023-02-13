import { When, Then, Given } from '@cucumber/cucumber';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';

Given('the server is running', async function () {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();
  this.app = app;
});

When('I GET {string}', async function (url) {
  this.request = request(this.app.getHttpServer()).get(url);
});

Then('the server should send back {string}', function (expectedResponse) {
  return this.request.expect(200).expect(expectedResponse);
});

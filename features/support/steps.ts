import { When, Then, Given } from '@cucumber/cucumber';
import * as request from 'supertest';
import * as expect from 'expect';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';

Given('the server is running', async function () {
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
  this.app = app;
});

When('I GET {string}', async function (url) {
  this.request = request(this.app.getHttpServer()).get(url);
});

When('I GET {string} {int}', async function (url, id) {
  this.id = id;
  this.request = request(this.app.getHttpServer()).get(`${url}/${id}`);
});

When('I DELETE {string} {int}', async function (url, id) {
  this.id = id;
  this.request = request(this.app.getHttpServer()).delete(`${url}/${id}`);
});

When('I POST {string}', async function (url) {
  this.body = {
    name: 'my coffee',
    brand: 'my brand',
    flavors: ['banana'],
  };
  this.request = request(this.app.getHttpServer())
    .post(url)
    .send(this.body)
    .set('Accept', 'application/json');
});

When('I PATCH {string} {int}', async function (url, id) {
  this.id = id;
  this.body = {
    name: 'my coffee',
    brand: 'my brand',
    flavors: ['banana'],
  };
  this.request = request(this.app.getHttpServer())
    .patch(`${url}/${id}`)
    .send(this.body)
    .set('Accept', 'application/json');
});

Then('the server should return {string}', function (expectedResult) {
  return this.request.expect(200).expect(expectedResult);
});

Then('the server should return a coffee', function () {
  return this.request.expect(200).expect({
    id: 1,
    name: 'Shipwreck Roast',
    brand: 'Buddy Brew',
    flavors: ['chocolate', 'vanilla'],
  });
});

Then('the server should create a coffee', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(201);
  });
});

Then('the server should update a coffee', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(200);
  });
});

Then('the server should delete a coffee', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(200);
  });
});

Then('the server should return an error', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual(
      expect.stringContaining(this.id.toString()),
    );
  });
});

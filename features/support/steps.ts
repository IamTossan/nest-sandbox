import { When, Then, AfterAll, Before, Given } from '@cucumber/cucumber';
import * as request from 'supertest';
import * as expect from 'expect';

import { getApp, stopApp } from './shared';

Before(async function () {
  this.app = await getApp();
});

AfterAll(async function () {
  await stopApp();
});

When('I GET {string}', async function (url) {
  this.request = request(this.app.getHttpServer()).get(url);
});

Then('the server should return a list of coffees', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach((coffee) => {
      expect(coffee).toMatchObject({
        name: expect.any(String),
        brand: expect.any(String),
        flavors: [expect.any(String)],
      });
    });
  });
});

When('I GET {string} #{int}', async function (url, id) {
  this.id = id;
  this.request = request(this.app.getHttpServer()).get(`${url}/${id}`);
});
When('I GET {string} with my id', async function (url) {
  this.request = request(this.app.getHttpServer()).get(`${url}/${this.id}`);
});

When('I DELETE {string} with my id', async function (url) {
  this.request = await request(this.app.getHttpServer())
    .delete(`${url}/${this.id}`)
    .expect(200);
});

Given('a coffee is created', async function () {
  this.body = {
    name: 'my coffee',
    brand: 'my brand',
    flavors: ['banana'],
  };
  this.request = await request(this.app.getHttpServer())
    .post('/coffees')
    .send(this.body)
    .set('Accept', 'application/json')
    .expect(201);
  this.id = this.request.body.id;
});

When('I POST {string}', async function (url) {
  this.body = {
    name: 'my coffee',
    brand: 'my brand',
    flavors: ['banana'],
  };
  this.request = await request(this.app.getHttpServer())
    .post(url)
    .send(this.body)
    .set('Accept', 'application/json')
    .expect(201);
  this.id = this.request.body.id;
});

When('I PATCH {string} with my id', async function (url) {
  this.body = {
    name: 'my coffee updated',
    brand: 'my brand updated',
    flavors: ['banana'],
  };
  this.request = await request(this.app.getHttpServer())
    .patch(`${url}/${this.id}`)
    .send(this.body)
    .set('Accept', 'application/json')
    .expect(200);
});

Then('the server should return {string}', function (expectedResult) {
  return this.request.expect(200).expect(expectedResult);
});

Then('the server should return my coffee', function () {
  return (this.request as request.Test).expect(200).expect((res) => {
    expect(res.body).toMatchObject(this.body);
  });
});

Then('the server should create a coffee', function () {
  return request(this.app.getHttpServer())
    .get(`/coffees/${this.id}`)
    .expect(200)
    .expect((res) => {
      expect(res.body).toMatchObject(this.body);
    });
});

Then('the server should update a coffee', function () {
  return request(this.app.getHttpServer())
    .get(`/coffees/${this.id}`)
    .expect(200)
    .expect((res) => {
      expect(res.body).toMatchObject(this.body);
    });
});

Then('the server should delete a coffee', function () {
  return request(this.app.getHttpServer())
    .get(`/coffees/${this.id}`)
    .expect(404);
});

Then('the server should return an error', function () {
  return (this.request as request.Test).expect((res) => {
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual(
      expect.stringContaining(this.id.toString()),
    );
  });
});

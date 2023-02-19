import { When, Then, AfterAll, Before, Given } from '@cucumber/cucumber';
import * as expect from 'expect';
import * as request from 'supertest';
import { LEGACY_WEBSOCKET_PROTOCOL, supertestWs } from 'supertest-graphql';

import { getApp, stopApp } from './shared';

Before(async function () {
  this.app = await getApp();
});

AfterAll(async function () {
  await stopApp();
});

Given('I subscribed to user created', async function () {
  this.query = await supertestWs(this.app.getHttpServer()).protocol(
    LEGACY_WEBSOCKET_PROTOCOL,
  ).subscribe(`
    subscription OnUserCreated {
      userCreated {
        id
        name
        email
      }
    }`);
});

When('I create a user', async function () {
  this.body = {
    name: 'Pixel',
    email: 'pixel@cqrs.co',
  };
  this.request = await request(this.app.getHttpServer())
    .post('/users')
    .send(this.body)
    .set('Accept', 'application/json')
    .expect(201);
});

Then('I should be notified on user creation', async function () {
  const { data } = await this.query.next().expectNoErrors();
  await this.query.close();

  expect(data.userCreated).toMatchObject({
    id: expect.any(String),
    name: this.body.name,
    email: this.body.email,
  });
});

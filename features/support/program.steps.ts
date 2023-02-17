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

When('I create a program', function () {});
Then('I should be able to access it', function () {});

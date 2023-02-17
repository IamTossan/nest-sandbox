import { When, Then, AfterAll, Before, Given } from '@cucumber/cucumber';
import * as expect from 'expect';
import request from 'supertest-graphql';
import gql from 'graphql-tag';

import { getApp, stopApp } from './shared';
import { Program } from '../../src/graphql';

Before(async function () {
  this.app = await getApp();
});

AfterAll(async function () {
  await stopApp();
});

When('I create a program', async function () {
  this.body = { name: 'test program' };
  const { data } = await request<{ createProgram: Program }>(
    this.app.getHttpServer(),
  )
    .query(
      gql`
        mutation CreateProgram($createProgramInput: CreateProgramInput!) {
          createProgram(createProgramInput: $createProgramInput) {
            id
            title
            version
            versionId
            courses {
              id
            }
          }
        }
      `,
    )
    .variables({ createProgramInput: this.body })
    .expectNoErrors();

  this.id = data.createProgram.id;
});

Then('I should be able to access it', async function () {
  const { data } = await request<{ program: Program }>(this.app.getHttpServer())
    .query(
      gql`
        query GetProgramById($id: ID!) {
          program(id: $id) {
            id
            title
            version
            versionId
            courses {
              id
            }
          }
        }
      `,
    )
    .variables({ id: this.id })
    .expectNoErrors();
  expect(data.program).toMatchObject({
    id: this.id,
    title: this.body.name,
    version: expect.any(String),
    versionId: expect.any(String),
    courses: expect.any(Array),
  });
});

import { When, Then, AfterAll, Before, Given } from '@cucumber/cucumber';
import * as expect from 'expect';
import request, {
  LEGACY_WEBSOCKET_PROTOCOL,
  supertestWs,
} from 'supertest-graphql';
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

Given('a program is created', async function () {
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
  this.targetId = data.createProgram.versionId;
});

When('I update the program', async function () {
  this.body = {
    programId: this.id,
    type: 'UpdateNode',
    targetId: this.targetId,
    payload: {
      title: 'my program [updated]',
    },
  };
  await request<{ createProgram: Program }>(this.app.getHttpServer())
    .query(
      gql`
        mutation UpdateProgram($updateProgramInput: UpdateProgramInput!) {
          updateProgram(updateProgramInput: $updateProgramInput) {
            id
            title
            version
            versionId
            courses {
              id
              title
            }
          }
        }
      `,
    )
    .variables({ updateProgramInput: this.body })
    .expectNoErrors();
});

Then('I should be able to check the updates', async function () {
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
    title: this.body.payload.title,
    version: expect.any(String),
    versionId: expect.any(String),
    courses: expect.any(Array),
  });
});

When('I publish the program', async function () {
  this.publishedBody = {
    label: 'public release',
    programId: this.id,
  };
  const { data } = await request<{ publishProgram: Program }>(
    this.app.getHttpServer(),
  )
    .query(
      gql`
        mutation PublishProgram($publishProgramInput: PublishProgramInput!) {
          publishProgram(publishProgramInput: $publishProgramInput) {
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
    .variables({ publishProgramInput: this.publishedBody })
    .expectNoErrors();
  this.publishedId = data.publishProgram.id;
});

Then('I should have my release', async function () {
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
    .variables({ id: this.publishedId })
    .expectNoErrors();
  expect(data.program).toMatchObject({
    id: this.publishedId,
    title: expect.any(String),
    version: this.publishedBody.label,
    versionId: expect.any(String),
    courses: expect.any(Array),
  });
});

Then('the program update did not impact the release', async function () {
  const { data: release } = await request<{ program: Program }>(
    this.app.getHttpServer(),
  )
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
    .variables({ id: this.publishedId })
    .expectNoErrors();
  const { data: latest } = await request<{ program: Program }>(
    this.app.getHttpServer(),
  )
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
  expect(latest.program.title).not.toEqual(release.program.title);
});

Given('I subscribed to program added', async function () {
  this.query = await supertestWs(this.app.getHttpServer()).protocol(
    LEGACY_WEBSOCKET_PROTOCOL,
  ).subscribe(`
      subscription OnProgramAdded {
        programAdded {
          id
          title
        }
      }`);
});

Then('I am notified on the created program', async function () {
  const { data } = await this.query.next().expectNoErrors();
  await this.query.close();
  expect(data.programAdded).toMatchObject({
    id: this.id,
    title: this.body.name,
  });
});

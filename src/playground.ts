import { Tab } from '@apollographql/graphql-playground-html/dist/render-playground-page';
export const playgroundTabs: Omit<Tab, 'endpoint'>[] = [
  {
    query: `
      query GetPrograms {
        programs {
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
    name: 'GetPrograms',
  },
  {
    query: `
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
    name: 'GetProgramById',
    variables: JSON.stringify({ id: '' }, null, 2),
  },
  {
    query: `
      subscription OnProgramAdded {
        programAdded {
          id
          title
        }
      }
    `,
    name: 'OnProgramAdded',
  },
  {
    query: `
      subscription OnUserCreated {
        userCreated {
          id
          name
          email
        }
      }
    `,
    name: 'OnUserCreated',
  },
  {
    query: `
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
    name: 'CreateProgram',
    variables: JSON.stringify(
      {
        createProgramInput: { name: 'example program' },
      },
      null,
      2,
    ),
  },
  {
    query: `
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
    name: 'UpdateProgram',
    variables: JSON.stringify(
      {
        updateProgramInput: {
          programId: '3113c131-da8d-4289-a2fc-3446d0c2d090',
          type: 'UpdateNode',
          targetId: '2d51c188-85eb-4abd-94b1-f03878f30dec',
          payload: {
            title: 'my course #32 updated',
          },
        },
      },
      null,
      2,
    ),
  },
  {
    query: `
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
    name: 'PublishProgram',
    variables: JSON.stringify(
      {
        publishProgramInput: {
          label: 'public release',
          programId: '3113c131-da8d-4289-a2fc-3446d0c2d090',
        },
      },
      null,
      2,
    ),
  },
];

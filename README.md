# Nest-sandbox

## Commands

```
# generate a migration file from entity changes
npx typeorm-ts-node-commonjs migration:generate migrations/<MIGRATION_NAME> -d typeorm-cli.config.ts
```

## How to play

Check the BDD tests on `/features`

```
$> docker-compose-up -d
$> pnpm run test:bdd
```

Play with graphql playground

```
$> docker-compose up -d
$> pnpm run start:dev
```

then open a browser on `localhost:3000/graphql`

## Things to think about

- How to organise cucumber steps?
- How to avoid too much splitting by types (entities, dtos, ...) and converge to feature slices?
- Implement absolute path resolution
- move from `graphql-subscription` to `graphql-ws` when playground is ready (+ update bdd tests)
- graceful shutdown (drain)
- group base classes (BaseEntity, BaseCommand, BaseEvent, ...)
- clean up configuration (hardcoded config to env variables)

Program

This proto follows on some odd ideas there: [persistent-tree](https://github.com/IamTossan/data-structures/tree/main/src/persistent-tree)

- add slug to ProgramNodes to correlate multiple versions of the same block
- validations (node type hierarchy, if id not found...)
- since ProgramNode is append-only, caching is easy
- patch past program versions => look into events and accounting techniques

Events

We use http calls for mutations and graphQL queries and subscriptions for reads

- add correlation Ids, version and other basic fields

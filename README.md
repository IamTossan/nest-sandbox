# Nest-sandbox

## Commands

```
# generate a migration file from entity changes
npx typeorm-ts-node-commonjs migration:generate migrations/<MIGRATION_NAME> -d typeorm-cli.config.ts
```

## Things to think about

- How to organise cucumber steps?
- How to avoid too much splitting by types (entities, dtos, ...) and converge to feature slices?
- Implement absolute path resolution

Program

This proto follows on some odd ideas there: [persistent-tree](https://github.com/IamTossan/data-structures/tree/main/src/persistent-tree)

- add slug to ProgramNodes to correlate multiple versions of the same block
- validations (node type hierarchy, if id not found...)
- since ProgramNode is append-only, caching is easy
- patch past program versions => look into events and accounting techniques

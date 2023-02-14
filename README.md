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

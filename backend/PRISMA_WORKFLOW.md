# Prisma Workflow

This document explains the Prisma-related commands in `backend/package.json` and the order to use them.

## Available Commands

### `yarn db:migrate`
Runs:

```bash
prisma migrate dev
```

Use this in local development when you change `prisma/schema.prisma`.

What it does:
- Creates a new migration if schema changes are detected
- Applies pending migrations to your local database
- Updates Prisma migration history

## `yarn db:generate`
Runs:

```bash
prisma generate
```

Use this after schema changes to regenerate the Prisma Client.

What it does:
- Regenerates `@prisma/client`
- Makes new models/fields available in your code

## `yarn db:status`
Runs:

```bash
prisma migrate status
```

Use this when you want to check whether your database matches your migration files.

What it does:
- Shows migration status
- Helps confirm whether your database is up to date

## `yarn db:deploy`
Runs:

```bash
prisma migrate deploy
```

Use this in production or deployment environments.

What it does:
- Applies existing migration files only
- Does not create new migrations

## Recommended Order

### Local Development

Use this order while working on the project locally:

```bash
yarn db:migrate
yarn db:generate
yarn db:status
yarn dev
```

When to use this flow:
- You changed `prisma/schema.prisma`
- You want your local database updated
- You want the backend to run with the latest Prisma client

### Production or Deployment

Use this order in server/deployment environments:

```bash
yarn db:deploy
yarn db:generate
```

When to use this flow:
- You already have migration files committed
- You only want to apply existing migrations safely

## Simple Rule to Remember

- Local development: `db:migrate` -> `db:generate` -> `db:status` -> `dev`
- Production: `db:deploy` -> `db:generate`

## Common Examples

### I changed the Prisma schema locally

Run:

```bash
yarn db:migrate
yarn db:generate
```

### I only want to check whether everything is in sync

Run:

```bash
yarn db:status
```

### I pulled the latest code and want to update my local database

Run:

```bash
yarn db:migrate
yarn db:generate
```

### I am deploying the backend

Run:

```bash
yarn db:deploy
yarn db:generate
```

## Important Note

Do not use `db:deploy` for creating new migrations during local development.

- `db:migrate` is for development
- `db:deploy` is for applying already-created migrations in deployment environments

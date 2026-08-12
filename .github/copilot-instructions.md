# Copilot Instructions

Node/Express + TypeScript (ESM) backend for a job board, using Prisma with PostgreSQL.

## Architecture

Layered, one direction only: `routes/` → `controllers/` → `services/` → Prisma.

- Controllers handle HTTP only: read the request, set status codes, send the response.
- Services own business logic. They never touch `req` or `res`.
- DAOs own all Prisma access. No other layer imports `prismaClient`.
- Routes are thin — delegate to a controller method.
- `app.ts` holds setup and middleware; `index.ts` only calls `app.listen()`.

## Conventions

- ESM: all relative imports need a `.js` extension, even from `.ts` files.
- Use `import type` for type-only imports.
- Never use `any`. It hides real bugs — prefer inference or an explicit type.
- Never cast Prisma results to a domain model (`rows as JobRoleModel[]`). Map them
  explicitly so the compiler catches shape mismatches.
- Domain models are classes in `models/`; mappers convert between DB rows and
  response models.
- Formatting and linting are handled by Biome (`npm run check`). Don't hand-format.

## Database

- Schema changes always go through a migration: `npx prisma migrate dev --name <change>`.
  Never edit an applied migration's SQL, and never hand-edit the database to match the schema.
- Renaming a schema field means updating every consumer: seed script, DAOs, models.
- `npm run db:setup` resets and seeds the local database.
- The local database runs in Docker on port 5432; `DATABASE_URL` lives in `.env`.

## Testing

- Vitest, tests in `tests/`. Run with `npm test`.
- Test through `app.ts` with supertest rather than starting a server.

## Logging and Commenting

- use logging throughout the program for key points where errors may occur or where important information is being processed. Use the logger utility for consistent formatting and log levels.

- ensure that all functions and methods have clear and concise comments explaining their purpose, parameters, and return values. This will help maintain code readability and assist future developers in understanding the codebase. functions require function level comments that describe the purpose of the function, its parameters, and its return value. Use JSDoc style comments for consistency.

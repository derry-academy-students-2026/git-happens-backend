# team2-backend

Team2 Backend — Express + TypeScript API for the Git Happens project.

## Prerequisites

- Node.js 20+
- npm

## Install

```bash
cd git-happens-backend
npm install

docker run --name job-board-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=job-board -p 5432:5432 -d postgres
npm run db:migrate
npm run db:setup
```

## Run

```bash
npm run dev     # watch mode, restarts on file changes (tsx watch)
npm start       # run the compiled build in dist/
```

Health check: `http://localhost:3000/health`

## Build

```bash
npm run build   # compile TypeScript to dist/
```

`npm start` runs `node dist/index.js`, so run `npm run build` first.

## Test

```bash
npm test              # run the suite once
npm run test:watch    # re-run on change
npm run test:coverage # run with a coverage report (coverage/index.html)
```

## Lint & format

```bash
npm run lint       # report lint issues (Biome)
npm run lint:fix   # apply safe lint fixes
npm run format     # format files
npm run check      # lint + format check
npm run ci:check   # non-writing check used in CI
```

## Migrate

The database schema is managed with Prisma (`prisma/schema.prisma`). Set
`DATABASE_URL` in your `.env` file before running any migration command.

```bash
npx prisma migrate dev            # apply pending migrations locally
npx prisma migrate dev --name x   # create and apply a new migration named "x"
npx prisma migrate deploy         # apply migrations in CI / deployed environments
npx prisma migrate status         # show which migrations have been applied
npx prisma migrate reset          # drop the database and re-run every migration
npx prisma generate               # regenerate the Prisma client after schema changes
npx prisma studio                 # browse the data in a local UI
```

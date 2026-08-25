ARG NODE_IMAGE=node:22-alpine

# --- Dependencies stage: full dependency graph, shared by the build and prune stages ---
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# Prisma needs OpenSSL to pick its query engine
RUN apk add --no-cache openssl ca-certificates
# optional: certs/ is untracked, so the glob matches nothing on machines without a proxy CA
COPY package.json certs*/ /tmp/certs/
RUN touch /tmp/ca-bundle.crt && cat /tmp/certs/*.crt >> /tmp/ca-bundle.crt 2>/dev/null || true
ENV NODE_EXTRA_CA_CERTS=/tmp/ca-bundle.crt
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# --- Build stage: generate the Prisma client against the app source ---
FROM deps AS build
COPY prisma ./prisma
COPY src ./src
# emits the client and the Linux query engine into src/generated/prisma
RUN npx prisma generate

# --- Production dependencies stage: strip dev packages from the existing install ---
FROM deps AS prod-deps
# optional deps must stay (esbuild resolves its platform binary through them), so the
# build-only prisma CLI and its deps are dropped explicitly instead
RUN npm prune --omit=dev --omit=peer \
	&& rm -rf node_modules/prisma node_modules/effect node_modules/@biomejs node_modules/typescript
# the client ships a WASM query engine per database; only postgresql can ever be loaded here
RUN for db in cockroachdb mysql sqlite sqlserver; do \
		rm -f node_modules/@prisma/client/runtime/query_engine_bg.$db.*; \
	done

# --- Runtime stage: prod deps, app source and the generated Prisma client only ---
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl ca-certificates

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY package.json tsconfig.json ./

# winston writes here, so it must exist and be writable by the non-root user
RUN mkdir -p logs && chown -R node:node logs

USER node

EXPOSE 4000

CMD ["npm", "run", "start"]

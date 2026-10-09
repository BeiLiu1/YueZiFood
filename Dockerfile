FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack disable && npm install -g pnpm@11.19.0 --registry=https://registry.npmmirror.com
ENV npm_config_disturl=https://npmmirror.com/mirrors/node

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set registry https://registry.npmmirror.com && pnpm install --frozen-lockfile

ARG SESSION_COOKIE_SECURE=true
ENV SESSION_COOKIE_SECURE=$SESSION_COOKIE_SECURE
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_DATABASE_PATH=/app/data/yuezi.db
ENV NUXT_MIGRATIONS_PATH=/app/migrations
ENV NUXT_UPLOADS_PATH=/app/uploads

WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/server/database/migrations ./migrations

RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node

EXPOSE 3000
VOLUME ["/app/data", "/app/uploads"]
CMD ["node", ".output/server/index.mjs"]

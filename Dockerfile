FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/schemas/package.json packages/schemas/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN npm ci

COPY packages/schemas packages/schemas
COPY apps/api apps/api
COPY apps/web apps/web
COPY tsconfig.json ./

ENV VITE_API_URL=/api

RUN npm run build --workspace @ai-war-room/schemas && \
    npm run build --workspace @ai-war-room/api && \
    npm run build --workspace @ai-war-room/web

FROM node:22-alpine AS api

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache wget

COPY package.json package-lock.json ./
COPY packages/schemas/package.json packages/schemas/
COPY apps/api/package.json apps/api/

RUN npm ci --omit=dev --workspace @ai-war-room/api --workspace @ai-war-room/schemas

COPY --from=build /app/packages/schemas/dist packages/schemas/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/src/db/migrations apps/api/dist/db/migrations

COPY scripts/docker-api-entrypoint.sh /usr/local/bin/docker-api-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-api-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health/ready || exit 1

ENTRYPOINT ["/usr/local/bin/docker-api-entrypoint.sh"]

FROM node:22-alpine AS temporal-worker

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/schemas/package.json packages/schemas/
COPY apps/api/package.json apps/api/

RUN npm ci --workspace @ai-war-room/api --workspace @ai-war-room/schemas

COPY --from=build /app/packages/schemas/dist packages/schemas/dist
COPY --from=build /app/apps/api/dist apps/api/dist

CMD ["node", "apps/api/dist/temporal/temporal.worker.js"]

FROM nginx:1.27-alpine AS web

RUN apk add --no-cache wget

COPY scripts/nginx-web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

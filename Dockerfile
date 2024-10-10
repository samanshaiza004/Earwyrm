FROM oven/bun AS build
WORKDIR /app
COPY . .
ENV NODE_ENV=production
RUN bun install ----frozen-lockfile
RUN bun run prisma:generate
RUN bun run build

FROM nginx:alpine AS frontend
COPY --from=build /app/packages/frontend/dist /prod/frontend/dist
COPY --from=build /app/packages/frontend/nginx.conf /prod/frontend
WORKDIR /prod/frontend

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./dist /usr/share/nginx/html

EXPOSE 5173

FROM gcr.io/distroless/base AS backend
COPY --from=build /app/packages/backend /prod/backend
WORKDIR /prod/backend

ENV NODE_ENV=production
CMD ["./server"]
EXPOSE 8090
# Fredi Electronics website + admin (Next.js + Payload, SQLite)
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# placeholder values only for the build; the real ones come from .env at runtime
ENV DATABASE_URL=file:/tmp/build.db PAYLOAD_SECRET=build-only NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]

# Frontend Builder Stage
FROM node:20.18.1-alpine3.21 AS frontend-builder
WORKDIR /usr/src/web

COPY apps/server/web ./
RUN npm i 
RUN npm run build

# Backend Builder Stage
FROM rust:slim-bullseye AS backend-builder
WORKDIR /usr/src

# Copy dependencies first to leverage caching
COPY Cargo.toml Cargo.lock ./
COPY apps/server/ ./apps/server/
COPY packages/resume_builder/ ./packages/resume_builder/

# Copy the frontend assets
COPY --from=frontend-builder /usr/src/web/out ./apps/server/web/out

RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build -p resumemk_server --release --target=x86_64-unknown-linux-musl

# Final Stage
FROM alpine:3.17.0 AS final
WORKDIR /app

RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY --from=backend-builder /usr/src/target/x86_64-unknown-linux-musl/release/resumemk_server ./resumemk

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["./resumemk"]

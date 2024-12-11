# Stage 1: Build React app
FROM oven/bun:1 AS frontend-builder
WORKDIR /usr/src

# Copy React app files
COPY app/ ./app

# Install dependencies and build the React app
WORKDIR /usr/src/app
RUN bun install 
RUN bun run build

# Stage 2: Build Rust binary
FROM rust:slim-bullseye AS backend-builder
WORKDIR /usr/src/backend

# Copy Rust files
COPY Cargo.toml .
COPY src/ ./src
COPY public/ ./public

# Add the frontend build files to the Rust project
COPY --from=frontend-builder /usr/src/app/dist ./app/dist

# Build the Rust binary for musl
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --target=x86_64-unknown-linux-musl

# Stage 3: Final image
FROM alpine:3.21.0 AS final
WORKDIR /app

# Install Chromium and its dependencies
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copy the Rust binary into the final image
COPY --from=backend-builder /usr/src/backend/target/x86_64-unknown-linux-musl/release/resumemk ./resumemk

# Expose the port
ENV PORT=8080
EXPOSE 8080

# Run the Rust binary
CMD ["./resumemk", "serve"]


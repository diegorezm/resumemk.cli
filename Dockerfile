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

# Copy React build files into the Rust project
COPY --from=frontend-builder /usr/src/app/dist ./app/dist

# Build the Rust binary
RUN cargo build --release

# Stage 3: Final image
FROM debian:bullseye-slim AS final
WORKDIR /app

# Copy the Rust binary into the final image
COPY --from=backend-builder /usr/src/backend/target/release/resumemk ./resumemk

# Expose the port
EXPOSE 8080

# Run the Rust binary
CMD ["./resumemk", "serve"]

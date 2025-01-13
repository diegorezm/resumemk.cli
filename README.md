# Resumemk

Resumemk is a simple resume builder written in Rust.
Keep in mind that this project uses headless Chrome to generate the PDF.
So, you need to have Chrome/Chromium installed on your machine.

## Self-hosting

You can self-host this project by using Docker.
Steps:

1. Build the Docker image

```bash
docker-compose up -d
```

2. Open http://localhost:8080 in your browser

## Build

This project has a CLI and a server, which are separate apps, and you have to build them individually. 
I recommend running the make commands.

### CLI

```bash
make install-cli
```

### Server

```bash
make install-server
```

## Usage

```bash
resumemk --help
```

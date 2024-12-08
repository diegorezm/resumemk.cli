# Resumemk

Resumemk is a simple resume builder written in Rust.
Keep you mind this project uses headless chrome to generate the pdf.
So you need to have chrome/chromium installed on your machine.

## Build

This project comes with an http server that serves a basic markdown editor on your browser.
If you don't want/need that, you can build the binary without the server feature.

```bash
cargo build --release --no-default-features
```

If you do want the server, you can run build normally.

```bash
cargo build --release
```

## Usage

### CLI

```bash
resumemk build --help
```

### HTTP Server

```bash
resumemk serve
```

Then open http://localhost:8080 in your browser.

## TODO

I think the biggest issue this app has is the binary size.
Currently, it's around 12MB, and that's mostly because of the headless chrome library.
I have to find a way to reduce the binary size, but I'm not sure how.

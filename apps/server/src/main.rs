use std::path::Path;

use include_dir::{include_dir, Dir};
use resume_builder::TCPResumeBuilder;
use serde::Deserialize;
use thiserror::Error;
use tide::Response;

const STATIC_FILES: Dir = include_dir!("$CARGO_MANIFEST_DIR/web/dist");

#[derive(Debug, Deserialize)]
struct GeneratorRequest {
    title: String,
    markdown: String,
    css: Option<String>,
}

async fn get_pdf(mut req: tide::Request<()>) -> tide::Result {
    let GeneratorRequest {
        title,
        markdown,
        css,
    } = req.body_json().await?;
    let stylesheet: Option<&str> = css.as_deref();
    let rsmb = TCPResumeBuilder::new();

    let pdf = rsmb.to_pdf(&markdown, &title, stylesheet, None);

    Ok(tide::Response::builder(200)
        .header("Content-Type", "application/pdf")
        .body(pdf)
        .build())
}

async fn get_html(mut req: tide::Request<()>) -> tide::Result {
    let GeneratorRequest {
        title,
        markdown,
        css,
    } = req.body_json().await?;
    let stylesheet: Option<&str> = css.as_deref();
    let rsmb = TCPResumeBuilder::new();
    let html = rsmb
        .get_html(&markdown, &title, stylesheet)
        .map_err(|e| {
            eprintln!("{}", e);
            tide::Error::from_str(500, "Something went wrong.")
        })
        .unwrap();

    Ok(tide::Response::builder(200)
        .header("Content-Type", "text/html")
        .body(html)
        .build())
}

async fn serve_embedded(req: tide::Request<()>) -> tide::Result {
    let mut path = req.url().path().trim_start_matches('/');
    if path == "/" || path == "" {
        path = "index.html";
    }
    let file = STATIC_FILES.get_file(path);
    if let Some(file) = file {
        let mime = mime_guess::from_path(path).first_or_octet_stream();
        Ok(Response::builder(200)
            .header("Content-Type", mime.as_ref())
            .body(file.contents())
            .build())
    } else {
        Ok(Response::builder(404).body("Not Found").build())
    }
}

#[derive(Error, Debug)]
enum ServerCreationError {
    #[error("failed to serve directory")]
    ServeDir(#[source] std::io::Error),
}

async fn serve(html_path: Option<String>) -> Result<(), ServerCreationError> {
    use ServerCreationError::*;
    let mut app = tide::new();
    app.at("/").get(tide::Redirect::new("/index.html"));
    if let Some(path_str) = html_path {
        println!("Serving static files from path: {}", path_str);
        let path = Path::new(&path_str);
        app.at("/").serve_dir(path).unwrap();
    } else {
        app.at("/*").get(serve_embedded);
    }
    app.at("/api/get_html").post(get_html);
    app.at("/api/get_pdf").post(get_pdf);
    let addr = "127.0.0.1:8080";
    println!("Listening at: {addr}");
    app.listen(addr).await.map_err(ServeDir).unwrap();
    Ok(())
}

#[async_std::main]
async fn main() {
    let mut args = std::env::args();
    let mut html_path: Option<String> = None;

    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--html-path" => {
                html_path = args.next().map(Into::into);
            }
            _ => {}
        }
    }

    serve(html_path).await.unwrap();
}

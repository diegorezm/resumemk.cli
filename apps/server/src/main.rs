mod assets;

use std::collections::HashMap;
use std::net::SocketAddr;

use http_body_util::combinators::BoxBody;
use http_body_util::{BodyExt, Collected, Empty, Full};
use hyper::body::{Bytes, Frame};
use hyper::header::HeaderValue;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use resume_builder::TCPResumeBuilder;
use tokio::net::TcpListener;

async fn server(
    req: Request<hyper::body::Incoming>,
) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    match (req.method(), req.uri().path()) {
        (&Method::GET, path) => render_asset(path),
        (&Method::POST, "/api/gen_pdf") => {
            let pdf_bytes = req.into_body().map_frame(|frame| {
                let frame = if let Ok(data) = frame.into_data() {
                    let data_str = String::from_utf8_lossy(&data);
                    match serde_json::from_str::<HashMap<String, String>>(&data_str) {
                        Ok(map) => {
                            let resume_builder = TCPResumeBuilder::new();

                            let title = map.get("title").map(|value| value.as_str());
                            let content = map.get("content").map(|value| value.as_str());
                            let stylesheet = map.get("css").map(|value| value.as_str());

                            if title.is_none() || content.is_none() {
                                return Frame::data(Bytes::new());
                            }

                            let pdf_options = headless_chrome::types::PrintToPdfOptions::default();

                            let pdf = resume_builder.to_pdf(
                                content.unwrap(),
                                title.unwrap(),
                                stylesheet,
                                pdf_options,
                            );

                            Bytes::from(pdf)
                        }
                        Err(err) => {
                            eprintln!("Error deserializing data: {:?}", err);
                            Bytes::new()
                        }
                    }
                } else {
                    Bytes::new()
                };
                Frame::data(frame)
            });
            let pdf = pdf_bytes
                .boxed()
                .collect()
                .await
                .unwrap_or(Collected::default())
                .to_bytes();

            if pdf.len() == 0 {
                let mut error = Response::new(empty());
                *error.status_mut() = StatusCode::INTERNAL_SERVER_ERROR;
                return Ok(error);
            }

            let pdf_len = pdf.len().to_string();
            let mut response = Response::new(full(pdf));
            response
                .headers_mut()
                .append("Content-Type", HeaderValue::from_static("application/pdf"));
            response
                .headers_mut()
                .append("Content-Length", HeaderValue::from_str(&pdf_len).unwrap());
            Ok(response)
        }
        _ => render_asset("404"),
    }
}

fn render_asset(path: &str) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    let asset = assets::serve_asset(path);
    match asset {
        Ok((data, mime_type)) => {
            let mut response = Response::new(full(data));
            response.headers_mut().append(
                "Content-Type",
                HeaderValue::from_str(mime_type.as_str()).unwrap(),
            );
            Ok(response)
        }
        Err(_err) => {
            let mut not_found = Response::new(empty());
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
    }
}

fn empty() -> BoxBody<Bytes, hyper::Error> {
    Empty::<Bytes>::new()
        .map_err(|never| match never {})
        .boxed()
}
fn full<T: Into<Bytes>>(chunk: T) -> BoxBody<Bytes, hyper::Error> {
    Full::new(chunk.into())
        .map_err(|never| match never {})
        .boxed()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "10000".to_string())
        .parse()
        .unwrap_or(1000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(addr).await?;
    println!("Listening on: http://localhost:{port}");
    loop {
        let (stream, _) = listener.accept().await?;
        let io = TokioIo::new(stream);
        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(server))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}

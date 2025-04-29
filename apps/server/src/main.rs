use http_body_util::combinators::BoxBody;
use http_body_util::BodyExt;
use http_body_util::{Empty, Full};
use hyper::body::Bytes;
use hyper::header::HeaderValue;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use include_dir::{include_dir, Dir};
use serde::Deserialize;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use tokio::net::TcpListener;

const STATIC_FILES: Dir = include_dir!("$CARGO_MANIFEST_DIR/web/dist");

#[derive(Debug, Deserialize)]
struct GeneratorRequest {
    title: String,
    markdown: String,
    css: Option<String>,
}

async fn request_handler(
    req: Request<hyper::body::Incoming>,
) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    let rmb = resume_builder::TCPResumeBuilder::new();
    match (req.method(), req.uri().path()) {
        (&Method::GET, path) => match serve_asset(path) {
            Ok((content, mime_type)) => {
                let mut response = Response::new(full(content));
                response.headers_mut().append(
                    "Content-Type",
                    HeaderValue::from_str(mime_type.as_str()).unwrap(),
                );
                Ok(response)
            }
            Err(_) => {
                let mut not_found = Response::new(empty());
                *not_found.status_mut() = StatusCode::NOT_FOUND;
                Ok(not_found)
            }
        },
        (&Method::POST, "/api/get_pdf") => {
            let full_body = match req.into_body().collect().await {
                Ok(collected) => collected.to_bytes(),
                Err(e) => {
                    eprintln!("Error collecting request body: {}", e);
                    return Ok(Response::builder()
                        .status(StatusCode::BAD_REQUEST)
                        .body(full(format!("Failed to read body: {}", e)))
                        .unwrap());
                }
            };

            match serde_json::from_slice::<GeneratorRequest>(&full_body) {
                Ok(generator_request) => {
                    let stylesheet: Option<&str> = generator_request.css.as_deref();
                    let blob = rmb.to_pdf(
                        &generator_request.markdown,
                        &generator_request.title,
                        stylesheet,
                        None,
                    );
                    let mut response = Response::new(full(blob));
                    response.headers_mut().append(
                        "Content-Type",
                        HeaderValue::from_str("application/pdf").unwrap(),
                    );
                    Ok(response)
                }
                Err(e) => {
                    eprintln!("Error parsing JSON: {}", e);
                    Ok(Response::builder()
                        .status(StatusCode::BAD_REQUEST)
                        .body(full(format!("Invalid JSON: {}", e)))
                        .unwrap())
                }
            }
        }
        _ => {
            let mut not_found = Response::new(empty());
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
    }
}

fn serve_asset(path: &str) -> Result<(Vec<u8>, String), ()> {
    let normalized_path = if path == "/" {
        "index.html".to_string()
    } else {
        let mut path_str = path[1..].to_string();
        if !path_str.contains(".") {
            let html_path = format!("{}.html", path_str);
            path_str = html_path
        }
        path_str.to_string()
    };

    if let Some(asset) = STATIC_FILES.get_file(normalized_path.as_str()) {
        let mime_type = infer_mime_type(normalized_path.as_str());
        Ok((asset.contents().to_vec(), mime_type.to_string()))
    } else {
        Err(())
    }
}

fn infer_mime_type(path: &str) -> &str {
    if path.ends_with(".html") {
        "text/html"
    } else if path.ends_with(".json") {
        "application/json"
    } else if path.ends_with(".css") {
        "text/css"
    } else if path.ends_with(".js") {
        "application/javascript"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".jpg") || path.ends_with(".jpeg") {
        "image/jpeg"
    } else if path.ends_with(".gif") {
        "image/gif"
    } else if path.ends_with(".ico") {
        "image/x-icon"
    } else {
        "application/octet-stream"
    }
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to install CTRL+C signal handler");
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
async fn main() {
    let address_str = std::env::var("ADDRESS").unwrap_or_else(|_| "0.0.0.0".to_string());
    let address: IpAddr = match address_str.parse() {
        Ok(ip) => ip,
        Err(_) => {
            eprintln!("Failed to parse ADDRESS environment variable. Using default: 0.0.0.0");
            IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0))
        }
    };

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);

    let addr = SocketAddr::from((address, port));
    let listener = TcpListener::bind(addr).await.unwrap();

    let http = http1::Builder::new();
    let graceful = hyper_util::server::graceful::GracefulShutdown::new();
    let mut signal = std::pin::pin!(shutdown_signal());
    println!("Serving at: {}:{}", addr.ip(), port);

    loop {
        tokio::select! {
            Ok((stream, _addr)) = listener.accept() => {
                let io = TokioIo::new(stream);
                let conn = http.serve_connection(io, service_fn(request_handler));
                // watch this connection
                let fut = graceful.watch(conn);
                tokio::spawn(async move {
                    if let Err(e) = fut.await {
                        eprintln!("Error serving connection: {:?}", e);
                    }
                });
            },

            _ = &mut signal => {
                eprintln!("graceful shutdown signal received");
                break;
            }
        }
    }

    tokio::select! {
        _ = graceful.shutdown() => {
            eprintln!("all connections gracefully closed");
        },
        _ = tokio::time::sleep(std::time::Duration::from_secs(10)) => {
            eprintln!("timed out wait for all connections to close");
        }
    }
}

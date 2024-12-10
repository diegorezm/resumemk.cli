use std::{
    collections::HashMap,
    io::{BufRead, BufReader, Read, Write},
    net::{TcpListener, TcpStream},
    str::from_utf8,
};

use rust_embed::Embed;

use crate::resume_builder::TCPResumeBuilder;

use std::env;

#[derive(Embed)]
#[folder = "app/dist"]
#[cfg(feature = "server")]
struct Assets;

#[cfg(feature = "server")]
pub fn init_server() {
    let port = env::var("PORT").unwrap_or_else(|_| "10000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let tcp_listener = TcpListener::bind(&addr).unwrap();
    println!("Listening on {}", addr);
    for stream in tcp_listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_connection(stream);
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buf_reader = BufReader::new(&stream);
    let mut content_length = 0;
    let mut request = String::new();
    let mut headers: HashMap<String, String> = HashMap::new();
    let mut body = String::new();

    for line in buf_reader.by_ref().lines() {
        match line {
            Ok(line) => {
                if line.is_empty() {
                    // End of headers.
                    break;
                } else if line.starts_with("GET")
                    || line.starts_with("POST")
                    || line.starts_with("PUT")
                    || line.starts_with("DELETE")
                {
                    request = line;
                } else {
                    // Parse headers.
                    if line.starts_with("Content-Length: ") {
                        content_length = line
                            .split("Content-Length: ")
                            .nth(1)
                            .and_then(|s| s.parse::<usize>().ok())
                            .unwrap_or(0);
                    }

                    let mut parts = line.splitn(2, ": ");
                    if let (Some(key), Some(value)) = (parts.next(), parts.next()) {
                        headers.insert(key.trim().to_lowercase(), value.trim().to_string());
                    } else {
                        eprintln!("Malformed header: {}", line);
                    }
                }
            }
            Err(e) => {
                eprintln!("Error while reading request line: {}", e);
            }
        }
    }

    if content_length > 0 {
        buf_reader
            .take(content_length as u64)
            .read_to_string(&mut body)
            .expect("Failed to read request body");
    }

    // Extract the requested path.
    let request_parts: Vec<&str> = request.split_whitespace().collect();
    let method = request_parts.get(0).unwrap_or(&"GET");
    let path = request_parts.get(1).unwrap_or(&"/");

    if method.eq(&"POST") {
        if path.eq(&"/get_pdf") {
            let request: HashMap<String, String> = serde_json::from_str(&body).unwrap();
            let resume_builder = TCPResumeBuilder::new();

            let title = request.get("title").unwrap();
            let content = request.get("content").unwrap();
            let pdf_options = headless_chrome::types::PrintToPdfOptions::default();

            let pdf = resume_builder.to_pdf(content.to_string(), title.to_string(), pdf_options);
            let headers = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: application/pdf\r\nContent-Length: {}\r\n\r\n",
                pdf.len()
            );

            let mut response = headers.into_bytes();
            response.extend(pdf);

            stream.write_all(&response).unwrap();
            stream.flush().unwrap();
            return;
        } else {
            let response = "HTTP/1.1 404 NOT FOUND\r\n\r\n404 Not Found";
            stream.write_all(response.as_bytes()).unwrap();
            return;
        }
    }

    match serve_asset(path) {
        Some(response) => stream.write_all(response.as_bytes()).unwrap(),
        None => {
            let response = "HTTP/1.1 404 NOT FOUND\r\n\r\n404 Not Found";
            stream.write_all(response.as_bytes()).unwrap();
        }
    }
}

fn serve_asset(path: &str) -> Option<String> {
    // Remove the leading `/` if present.
    let normalized_path = if path == "/" {
        "index.html"
    } else {
        &path[1..]
    };

    // Fetch the asset from embedded assets.
    if let Some(asset) = Assets::get(normalized_path) {
        let mime_type = infer_mime_type(normalized_path);
        let content = from_utf8(asset.data.as_ref()).ok()?;
        Some(format!(
            "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\n\r\n{}",
            mime_type,
            content.len(),
            content
        ))
    } else {
        None // Asset not found.
    }
}

fn infer_mime_type(path: &str) -> &str {
    if path.ends_with(".html") {
        "text/html"
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
    } else {
        "application/octet-stream"
    }
}

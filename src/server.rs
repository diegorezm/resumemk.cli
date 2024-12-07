use std::{
    collections::HashMap,
    io::{BufRead, BufReader, Read, Write},
    net::{TcpListener, TcpStream},
};

pub fn init() {
    let listener = TcpListener::bind("127.0.0.1:8080")
        .map_err(|e| {
            eprintln!("failed to bind to port: {}", e);
        })
        .unwrap();
    println!("listening on http://127.0.0.1:8080");
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_connection(stream);
            }
            Err(e) => {
                eprintln!("failed to accept connection: {}", e);
            }
        }
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = BufReader::new(&stream);
    let mut content_length = 0;
    let mut headers: HashMap<String, String> = HashMap::new();
    let mut request = String::new();

    for line in buffer.by_ref().lines() {
        match line {
            Ok(line) => {
                if line.starts_with("GET")
                    || line.starts_with("POST")
                    || line.starts_with("PUT")
                    || line.starts_with("DELETE")
                {
                    request = line;
                } else if line.is_empty() {
                    break;
                } else {
                    let mut parts = line.splitn(2, ':');
                    let key = parts.next().unwrap().trim().to_lowercase();
                    let value = parts.next().unwrap().trim();
                    if key == "content-length" {
                        content_length = value
                            .parse::<i32>()
                            .map_err(|e| eprintln!("invalid content length: {}", e))
                            .unwrap();
                    }
                    headers.insert(key, value.to_string());
                }
            }
            Err(e) => {
                eprintln!("failed to read line: {}", e);
                break;
            }
        }
    }

    // read the body, if exists
    let mut body = String::new();
    if content_length > 0 {
        buffer
            .take(content_length as u64)
            .read_to_string(&mut body)
            .expect("Failed to read request body");
    }

    if request == "GET / HTTP/1.1" {
        let html = include_str!("../dist/index.html");
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\n\r\n{}",
            html.len(),
            html
        );
        stream.write_all(response.as_bytes()).unwrap();
    } else if request == "GET /_client.js HTTP/1.1" {
        let js = include_str!("../dist/_client.js");
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/javascript\r\nContent-Length: {}\r\n\r\n{}",
            js.len(),
            js
        );
        stream.write_all(response.as_bytes()).unwrap();
    } else if request == "GET /style.css HTTP/1.1" {
        let css = include_str!("../dist/style.css");
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: text/css\r\nContent-Length: {}\r\n\r\n{}",
            css.len(),
            css
        );
        stream.write_all(response.as_bytes()).unwrap();
    } else {
        let response = format!(
            "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: {}\r\n\r\n{}",
            "Not Found".len(),
            "Not Found"
        );
        stream.write_all(response.as_bytes()).unwrap();
    }
}

use rust_embed::Embed;

#[derive(Embed)]
#[folder = "web/out"]
struct Assets;

pub fn serve_asset(path: &str) -> Result<(Vec<u8>, String), ()> {
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

    if let Some(asset) = Assets::get(normalized_path.as_str()) {
        let mime_type = infer_mime_type(normalized_path.as_str());
        Ok((asset.data.to_vec(), mime_type.to_string()))
    } else {
        Err(())
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
    } else if path.ends_with(".ico") {
        "image/x-icon"
    } else {
        "application/octet-stream"
    }
}

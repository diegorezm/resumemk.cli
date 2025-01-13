use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

use headless_chrome::types::PrintToPdfOptions;
use headless_chrome::{Browser, LaunchOptions, LaunchOptionsBuilder};
use markdown::{to_html_with_options, CompileOptions, Options};

fn get_default_stylesheet() -> (String, String) {
    let stylesheet = include_str!("../template/resume.css").to_string();
    let base_stylesheet = include_str!("../template/base.css").to_string();
    return (stylesheet, base_stylesheet);
}

#[derive(Debug, Clone)]
pub struct CLIResumeBuilder {
    stylesheet: String,
    base_stylesheet: String,
}

impl CLIResumeBuilder {
    pub fn new() -> Self {
        let (stylesheet, base_stylesheet) = get_default_stylesheet();
        Self {
            stylesheet,
            base_stylesheet,
        }
    }

    pub fn set_stylesheet(&mut self, stylesheet: &Path) {
        self.stylesheet = std::fs::read_to_string(stylesheet).unwrap_or("".to_string());
    }

    pub fn save_to_html(
        &self,
        input: &Path,
        output: &Path,
        title: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let input_file_contents = std::fs::read_to_string(input)?;
        let markdown = to_html_with_options(
            input_file_contents.as_str(),
            &Options {
                compile: CompileOptions {
                    allow_dangerous_html: true,
                    ..CompileOptions::default()
                },
                ..Options::default()
            },
        )
        .map_err(|e| e.to_string())?;

        let html_raw = include_str!("../template/resume.html");
        let html = html_raw
            .replace("{content}", &markdown)
            .replace(
                "<!-- style -->",
                &format!(
                    "<style>{}{}</style>",
                    &self.base_stylesheet, &self.stylesheet
                ),
            )
            .replace("{title}", title);

        let mut output_file = File::create(output)?;
        output_file.write_all(html.as_bytes())?;

        let full_path = fs::canonicalize(output)?
            .to_str()
            .ok_or("Failed to convert full path to string")?
            .to_string();
        Ok(full_path)
    }

    pub fn save_to_pdf(
        &self,
        input: &Path,
        output: &Path,
        pdf_options: PrintToPdfOptions,
        title: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let html_output = Path::new(input).with_extension("html");
        let input_html = self.save_to_html(input, &html_output, title)?;

        let input_url = format!("file://{}", input_html);

        let browser = Browser::new(LaunchOptionsBuilder::default().build()?)?;
        let tab = browser.new_tab()?;
        tab.navigate_to(&input_url)?;
        tab.wait_until_navigated()?;

        let bytes = tab.print_to_pdf(Some(pdf_options))?;

        let mut output_file = File::create(output)?;
        output_file.write_all(&bytes)?;

        let html_output = Path::new(input).with_extension("html");
        std::fs::remove_file(html_output)?;

        Ok(())
    }

    #[allow(dead_code)]
    pub fn to_html_string(
        &self,
        input: &Path,
        title: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let input_file_contents = std::fs::read_to_string(input)?;
        let markdown = markdown::to_html(input_file_contents.as_str());
        let html_raw = include_str!("../template/resume.html");
        let html = html_raw
            .replace("{content}", &markdown)
            .replace(
                "<!-- style -->",
                &format!(
                    "<style>{}{}</style>",
                    &self.base_stylesheet, &self.stylesheet
                ),
            )
            .replace("{title}", title);
        Ok(html)
    }

    #[allow(dead_code)]
    pub fn to_pdf_bytes(
        &self,
        input: &Path,
        pdf_options: PrintToPdfOptions,
        title: &str,
    ) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        let html_output = Path::new(input).with_extension("html");
        let input_html = self.save_to_html(input, &html_output, title).unwrap();

        let input_url = format!("file://{}", input_html);

        let browser = Browser::new(LaunchOptions::default()).unwrap();
        let tab = browser.new_tab().unwrap();
        tab.navigate_to(&input_url).unwrap();
        tab.wait_until_navigated().unwrap();

        let bytes = tab.print_to_pdf(Some(pdf_options)).unwrap();

        let html_output = Path::new(input).with_extension("html");
        std::fs::remove_file(html_output).unwrap();

        Ok(bytes)
    }
}

#[derive(Debug, Clone)]
pub struct TCPResumeBuilder {
    stylesheet: String,
    base_stylesheet: String,
    default_html_path: String,
}

impl TCPResumeBuilder {
    pub fn new() -> Self {
        let (stylesheet, base_stylesheet) = get_default_stylesheet();
        let default_html_path = "/tmp/resume.html".to_string();
        Self {
            stylesheet,
            default_html_path,
            base_stylesheet,
        }
    }

    fn save_to_html(
        &self,
        markdown: String,
        title: &str,
        stylesheet: Option<&String>,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let styles = stylesheet.unwrap_or(&self.stylesheet);
        let markdown = to_html_with_options(
            markdown.as_str(),
            &Options {
                compile: CompileOptions {
                    allow_dangerous_html: true,
                    ..CompileOptions::default()
                },
                ..Options::default()
            },
        )
        .map_err(|e| e.to_string())?;

        let html_raw = include_str!("../template/resume.html");
        let html = html_raw
            .replace("{content}", &markdown)
            .replace(
                "<!-- style -->",
                &format!("<style>{}{}</style>", &self.base_stylesheet, styles),
            )
            .replace("{title}", title);

        let mut output_file = File::create(self.default_html_path.clone())?;
        output_file.write_all(html.as_bytes())?;

        let full_path = fs::canonicalize(self.default_html_path.clone())?
            .to_str()
            .ok_or("Failed to convert full path to string")?
            .to_string();
        Ok(full_path)
    }

    pub fn to_pdf(
        &self,
        markdown: String,
        title: String,
        stylesheet: Option<&String>,
        pdf_options: PrintToPdfOptions,
    ) -> Vec<u8> {
        let html_file = self
            .save_to_html(markdown, title.as_str(), stylesheet)
            .unwrap();
        let html_url = format!("file://{}", html_file);

        let options = LaunchOptionsBuilder::default()
            .headless(true)
            .sandbox(false)
            .build()
            .unwrap();

        let browser = Browser::new(options)
            .map_err(|e| {
                eprintln!("Error while creating browser: {}", e);
            })
            .unwrap();
        let tab = browser
            .new_tab()
            .map_err(|e| {
                eprintln!("Error while creating new tab: {}", e);
            })
            .unwrap();

        tab.navigate_to(&html_url)
            .map_err(|e| {
                eprintln!("Error while navigating to URL: {}", e);
            })
            .unwrap();

        tab.wait_until_navigated()
            .map_err(|e| {
                eprintln!("Error while waiting for navigation: {}", e);
            })
            .unwrap();

        let bytes = tab
            .print_to_pdf(Some(pdf_options))
            .map_err(|e| {
                eprintln!("Error while printing to PDF: {}", e);
            })
            .unwrap();

        std::fs::remove_file(html_file)
            .map_err(|e| {
                eprintln!("Error while removing HTML file: {}", e);
            })
            .unwrap();
        bytes
    }

    pub fn default_stylesheet(&self) -> String {
        return self.stylesheet.clone();
    }
}

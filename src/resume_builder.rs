use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

use headless_chrome::types::PrintToPdfOptions;
use headless_chrome::{Browser, LaunchOptions};
use markdown::{to_html_with_options, CompileOptions, Options};

#[derive(Debug, Clone)]
pub struct CLIResumeBuilder {
    stylesheet: String,
}

impl CLIResumeBuilder {
    pub fn new() -> Self {
        let stylesheet = Self::get_default_stylesheet();
        Self { stylesheet }
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

        let html_raw = include_str!("../public/resume.html");
        let html = html_raw
            .replace("{content}", &markdown)
            .replace(
                "<!-- style -->",
                &format!("<style>{}</style>", &self.stylesheet),
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

        let browser = Browser::new(LaunchOptions::default())?;
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
        let html_raw = include_str!("../public/resume.html");
        let html = html_raw
            .replace("{content}", &markdown)
            .replace(
                "<!-- style -->",
                &format!("<style>{}</style>", &self.stylesheet),
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

    fn get_default_stylesheet() -> String {
        return include_str!("../public/resume.css").to_string();
    }
}

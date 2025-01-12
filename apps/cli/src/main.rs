use clap::Parser;
use resume_builder::CLIResumeBuilder;
use std::{path::PathBuf, str::FromStr};

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct CLI {
    #[clap(subcommand)]
    pub command: Command,
}

#[derive(Parser, Debug)]
pub enum Command {
    #[command(about = "Build a resume from a markdown file")]
    Build {
        /// Input file path
        #[clap(short, long)]
        input: PathBuf,

        /// Output file path (optional). If not provided, it defaults to the input file name with the specified output type extension.
        #[clap(short, long)]
        output: Option<PathBuf>,

        /// Output type (pdf or html). Defaults to pdf.
        #[clap(name = "type", short, long, default_value = "pdf")]
        output_type: OutputType,

        /// Set a custom stylesheet for the output. Defaults to the default stylesheet.
        #[clap(short, long)]
        stylesheet: Option<PathBuf>,

        // Set the title of the resume. Defaults to the input file name.
        #[clap(long)]
        title: Option<String>,
    },
}

#[derive(Debug, Clone)]
pub enum OutputType {
    PDF,
    HTML,
}

impl FromStr for OutputType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pdf" => Ok(OutputType::PDF),
            "html" => Ok(OutputType::HTML),
            _ => Err(format!("Invalid output type: {}", s)),
        }
    }
}

impl OutputType {
    /// Returns the file extension for the given output type.
    pub fn as_extension(&self) -> &'static str {
        match self {
            OutputType::PDF => "pdf",
            OutputType::HTML => "html",
        }
    }
}

pub fn init_cli() -> CLI {
    CLI::parse()
}

pub fn get_output_path(
    input: &PathBuf,
    output: &Option<PathBuf>,
    output_type: &OutputType,
) -> PathBuf {
    output.clone().unwrap_or_else(|| {
        let mut new_path = input.clone();
        new_path.set_extension(output_type.as_extension());
        new_path
    })
}

fn main() {
    let cli = init_cli();
    match cli.command {
        Command::Build {
            input,
            output,
            output_type,
            stylesheet,
            title,
        } => {
            let output_path = get_output_path(&input, &output, &output_type);
            let document_title = title.unwrap_or(output_path.to_str().unwrap().to_string());
            let mut cli_resume_builder = CLIResumeBuilder::new();

            if let Some(stylesheet) = stylesheet {
                cli_resume_builder.set_stylesheet(stylesheet.as_path());
            }

            let pdf_options = headless_chrome::types::PrintToPdfOptions::default();

            match output_type {
                OutputType::HTML => {
                    match cli_resume_builder.save_to_html(
                        input.as_path(),
                        output_path.as_path(),
                        document_title.as_str(),
                    ) {
                        Ok(path) => {
                            println!("Successfully saved to {}", path);
                        }
                        Err(e) => {
                            println!("Error: {}", e);
                        }
                    }
                }
                OutputType::PDF => {
                    match cli_resume_builder.save_to_pdf(
                        input.as_path(),
                        output_path.as_path(),
                        pdf_options,
                        document_title.as_str(),
                    ) {
                        Ok(_) => {
                            println!("Successfully saved to {}", output_path.to_str().unwrap());
                        }
                        Err(e) => {
                            println!("Error: {}", e);
                        }
                    }
                }
            }
        }
    }
}

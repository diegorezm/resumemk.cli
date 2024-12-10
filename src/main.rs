mod cli;
mod resume_builder;
#[cfg(feature = "server")]
mod server;
use cli::{get_output_path, init_cli, Command, OutputType};
use resume_builder::CLIResumeBuilder;

fn main() {
    let cli = init_cli();
    match cli.command {
        #[cfg(feature = "server")]
        Command::Serve {} => {
            server::init_server();
        }
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

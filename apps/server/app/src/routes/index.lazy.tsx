import {Button} from "@/components/ui/button";
import {createLazyFileRoute, Link} from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <section className="flex flex-col items-center justify-center w-full h-screen px-4 dot-pattern text-th-background">
        <div className="max-w-4xl text-center rounded-md">
          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Create Your Resume Using{" "}
            <span className="text-th-primary">Markdown!</span>
          </h1>
          <p className="mb-8 text-lg text-th-secondary">
            Use our intuitive web editor for a seamless online experience, or leverage our powerful CLI tool to work directly from your terminal
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/documents">
              <Button size="lg">Get Started</Button>
            </Link>
            <a href="/#learn-more">
              <Button
                size="lg"
                variant="outline"
                className="!text-th-background"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section
        id="learn-more"
        className="w-full h-screen px-6 py-16 bg-th-muted text-th-foreground"
      >
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="mb-4 text-4xl font-bold">
              Create Resumes with{" "}
              <span className="text-th-primary">Markdown</span>
            </h2>
            <p className="mb-6 text-lg text-th-foreground/80">
              Use this tool to write your resume effortlessly with Markdown. For
              advanced users, HTML is fully supported, giving you ultimate
              flexibility.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link to="/documents">
                <Button size="lg">Web Editor</Button>
              </Link>
              <a href="https://github.com/diegorezm/resumemk#build" target="_blank">
                <Button size="lg" variant="outline">
                  CLI Tool
                </Button>
              </a>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="flex-1">
            <div className="flex items-center justify-center w-full shadow-md h-96 md:h-96 bg-th-background rounded-md">
              <img
                src="/editor-showcase.png"
                alt="editor showcase"
                className="w-full h-full rounded-md"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

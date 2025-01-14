"use client";
import {ChevronLeft, Download, Pencil, Trash} from "@/components/icons";
import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {useResumeStore} from "@/store/use-resume-store";
import {downloadMarkdown, downloadPDF} from "@/utils/request";
import {Editor} from "@monaco-editor/react";
import {parse} from "marked";
import {FormEvent, Suspense, useEffect, useMemo, useState} from "react";
import {redirect, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {LoadingPage} from "@/components/loading-page";

export default function ResumePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <div className="mb-16">
        <ResumePageContent />
      </div>
    </Suspense>
  );
}

function ResumePageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    resumes,
    setResumeContent,
    setResumeCss,
    removeResume,
    setResumeTitle,
  } = useResumeStore();

  const resume = useMemo(() => {
    return resumes.find((e) => e.id === id);
  }, [resumes, id]);

  const [activeTab, setActiveTab] = useState<"markdown" | "css">("markdown");
  const [markdown, setMarkdown] = useState(resume?.content ?? "");
  const [styles, setStyles] = useState(resume?.css ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const navigation = useRouter();

  const onEditSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (resume?.id === undefined) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString() ?? "";

    if (title.length < 2) {
      setFormError("The title has to have more than two characters.");
      return;
    }

    if (title.length > 12) {
      setFormError("The title cannot have more than 12 characters.");
      return;
    }

    setResumeTitle(resume?.id, title);
    setOpenEditDialog(false);
    form.reset();
  };

  const injectStyles = (styles: string) => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    styleElement.id = "injected-styles";
    document.head.appendChild(styleElement);
  };

  useEffect(() => {
    injectStyles(styles);
    return () => {
      const styleElement = document.getElementById("injected-styles");
      if (styleElement) styleElement.remove();
    };
  }, [styles]);

  useEffect(() => {
    setResumeCss(resume ? resume.id : "", styles);
    setResumeContent(resume ? resume.id : "", markdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, styles]);

  useEffect(() => {
    if (resume) {
      setMarkdown(resume.content);
      setStyles(resume.css);
    }
  }, [resume]);

  if (!id) return redirect("/resumes");

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold text-th-red">Resume Not Found</h1>
        <Link href="/resumes">
          <Button variant="outline" className="mt-4">
            Go Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-2 gap-4">
        <header className="flex items-center justify-between w-full px-4 py-2 bg-th-primary text-th-background rounded-md">
          <div className="flex items-center gap-2">
            <Link href="/resumes">
              <Button variant="ghost" size="sm" className="!text-th-background">
                <ChevronLeft className="text-th-background" /> Go back
              </Button>
            </Link>
            <h1 className="text-lg font-bold">{resume.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                removeResume(resume);
                navigation.push("/resumes");
              }}
            >
              <Trash className="text-th-background" size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setOpenEditDialog(!openEditDialog);
              }}
            >
              <Pencil className="text-th-background" size={20} />
            </Button>
          </div>
        </header>
        <div className="flex w-full h-[90vh] gap-2">
          <div className="w-full h-full space-y-2">
            <nav className="space-x-2">
              <Button
                variant={activeTab === "markdown" ? "primary" : "outline"}
                onClick={() => setActiveTab("markdown")}
              >
                Markdown
              </Button>
              <Button
                variant={activeTab === "css" ? "primary" : "outline"}
                onClick={() => setActiveTab("css")}
              >
                CSS
              </Button>
            </nav>
            {activeTab === "markdown" && (
              <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                defaultLanguage="markdown"
                defaultValue={markdown}
                className="border rounded-md border-th-foreground"
                onChange={(e) => setMarkdown(e || "")}
                value={markdown}
                options={{
                  autoIndent: "brackets",
                  minimap: {
                    enabled: false,
                  },
                }}
              />
            )}
            {activeTab === "css" && (
              <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                defaultLanguage="css"
                defaultValue={styles}
                className="border rounded-md border-th-foreground"
                onChange={(e) => setStyles(e || "")}
                value={styles}
                options={{
                  autoIndent: "brackets",
                  minimap: {
                    enabled: false,
                  },
                }}
              />
            )}
          </div>
          <div className="w-full h-full space-y-2">
            <nav className="flex justify-end w-full gap-2">
              <Button
                variant={"ghost"}
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  downloadMarkdown(resume).finally(() => setLoading(false));
                }}
              >
                <Download /> Markdown
              </Button>
              <Button
                disabled={loading}
                variant={"ghost"}
                onClick={() => {
                  setLoading(true);
                  downloadPDF(resume)
                    .then((e) => {
                      if (e.error) {
                        alert(e.error);
                      }
                    })
                    .finally(() => setLoading(false));
                }}
              >
                <Download /> PDF
              </Button>
            </nav>
            <div
              className="w-full h-full overflow-y-auto border resume border-th-foreground rounded-md"
              dangerouslySetInnerHTML={{
                __html: parse(markdown, {
                  gfm: true,
                }),
              }}
            />
          </div>
        </div>
      </div>
      <Dialog
        open={openEditDialog}
        onOpenChange={() => setOpenEditDialog(!openEditDialog)}
      >
        <form
          onSubmit={onEditSubmit}
          className="flex flex-col items-start w-full gap-2"
        >
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            id="title"
            className="input"
            defaultValue={resume.title}
            autoFocus
          />
          {formError && <p className="text-sm text-th-red">{formError}</p>}
          <div className="w-full py-2 mt-2 border-t space-x-4 border-t-th-muted">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOpenEditDialog(false)}
            >
              Cancel
            </Button>
            <Button>Submit</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

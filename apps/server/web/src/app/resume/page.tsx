"use client";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/use-resume-store";
import { Suspense, useEffect, useMemo, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoadingPage } from "@/components/loading-page";
import { EditorTabs } from "./editor-tabs";
import { Preview } from "./preview";
import { Header } from "./header";
import { EditDialog } from "./edit-dialog";
import { useShowPreviewStore } from "./show-preview-store";
import { cn } from "@/utils/cn";

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
  const { resumes, setResumeContent, setResumeCss } = useResumeStore();
  const { showPreview } = useShowPreviewStore();

  const resume = useMemo(() => {
    return resumes.find((e) => e.id === id);
  }, [resumes, id]);

  const [markdown, setMarkdown] = useState(resume?.content ?? "");
  const [styles, setStyles] = useState(resume?.css ?? "");

  const [openEditDialog, setOpenEditDialog] = useState(false);

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
        <Header
          openEditDialog={openEditDialog}
          setOpenEditDialog={setOpenEditDialog}
          resume={resume}
        />
        <div className="flex w-full h-[90vh] gap-2">
          <div
            className={cn(
              showPreview && "hidden md:block md:w-1/2 h-full",
              !showPreview && "block w-full h-full",
            )}
          >
            <EditorTabs
              markdown={markdown}
              setMarkdown={setMarkdown}
              styles={styles}
              setStyles={setStyles}
            />
          </div>
          <div
            className={cn(
              showPreview && "block w-full h-full md:w-1/2",
              !showPreview && "hidden",
            )}
          >
            <Preview resume={resume} />
          </div>
        </div>
      </div>
      <EditDialog
        openEditDialog={openEditDialog}
        setOpenEditDialog={setOpenEditDialog}
        resume={resume}
      />
    </>
  );
}

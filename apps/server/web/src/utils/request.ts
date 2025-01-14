import { Resume } from "@/types";

export async function downloadPDF(resume: Resume) {
  try {
    const response = await fetch("/api/gen_pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resume),
    });
    const blob = await response.blob();
    const link = document.createElement("a");
    link.hidden = true;
    link.href = URL.createObjectURL(blob);
    link.download = `${resume.title}.pdf`;
    link.click();
    link.remove();
    return { message: "Download completed!", error: undefined };
  } catch (e: unknown) {
    console.error(e);
    return { error: "Something went wrong!", message: undefined };
  }
}

export async function downloadMarkdown(resume: Resume) {
  const link = document.createElement("a");
  link.hidden = true;
  link.href =
    "data:text/plain;charset=utf-8," + encodeURIComponent(resume.content);
  link.download = `${resume.title}.md`;
  link.click();
  link.remove();
}

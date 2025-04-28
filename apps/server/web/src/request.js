export async function get_pdf(resume) {
  const req = {
    title: resume.title,
    markdown: resume.content,
    css: resume.css,
  };

  const response = await fetch("/api/get_pdf", {
    method: "POST",
    body: JSON.stringify(req),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const blob = await response.blob();
  const link = document.createElement("a");
  link.hidden = true;
  link.href = URL.createObjectURL(blob);
  link.download = `${resume.title}.pdf`;
  link.click();
  link.remove();
}

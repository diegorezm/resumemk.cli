import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";

import { marked } from "marked";

import { setupModal } from "./modal.js";
import { getResume, saveResume, deleteResume } from "/resume_store.js";
import { get_pdf } from "./request.js";
import solarizedLight from "./solarized_light.json";

monaco.editor.defineTheme("solarized-light", solarizedLight);
monaco.editor.setTheme("solarized-light");

const resumeTitleElement = document.getElementById("resume_title");

const downloadMarkdownBtn = document.getElementById("download_markdown_btn");
const downloadPdfBtn = document.getElementById("download_pdf_btn");

const updateDocumentBtn = document.getElementById("update_document_btn");
const updateDocumentInput = document.getElementById("document_name");

const deleteButton = document.getElementById("delete_button");

const togglePreviewButton = document.getElementById("toggle_preview_button");
const editorContainer = document.getElementById("editor-container");
const previewContainer = document.getElementById("preview_container");
const resumeContent = document.getElementById("resume_content");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const markdownEditorTab = document.getElementById("markdown-editor-tab");
const cssEditorTab = document.getElementById("css-editor-tab");
const markdownEditorWrapper = document.getElementById(
  "markdown-editor-wrapper",
);
const cssEditorWrapper = document.getElementById("css-editor-wrapper");

const documentNameInput = document.getElementById("document_name");

const myModal = document.getElementById("my_modal");

if (!id) {
  window.location.href = "/dashboard.html";
}

let resume = getResume(id);
resumeTitleElement.textContent = resume.title;

let markdownEditor, cssEditor;
let activeEditor = "markdown";

documentNameInput.value = resume.title;

setupModal(() => {
  documentNameInput.value = resume.title;
});

// Initialize Markdown Editor
markdownEditor = monaco.editor.create(markdownEditorWrapper, {
  value: resume.content,
  language: "markdown",
  theme: "solarized-light",
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
});

// Initialize CSS Editor
cssEditor = monaco.editor.create(cssEditorWrapper, {
  value: resume.css,
  language: "css",
  theme: "solarized-light",
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
});

cssEditorWrapper.classList.add("hidden");
updatePreview(resume.content);
injectResumeStyles(resume.css);

markdownEditor.onDidChangeModelContent((event) => {
  const newContent = markdownEditor.getValue();
  resume.content = newContent;
  saveResume(resume);
  updatePreview(newContent);
  injectResumeStyles(resume.css);
});

// Event listener for CSS editor changes
cssEditor.onDidChangeModelContent((event) => {
  const newCss = cssEditor.getValue();
  resume.css = newCss;
  saveResume(resume);
  injectResumeStyles(newCss);
});

// Event Listeners for switching editors
markdownEditorTab.addEventListener("click", () => {
  activeEditor = "markdown";

  markdownEditorTab.classList.remove("tab-inactive");
  cssEditorTab.classList.remove("tab-active");

  markdownEditorTab.classList.add("tab-active");
  cssEditorTab.classList.add("tab-inactive");

  markdownEditorWrapper.classList.remove("hidden");
  cssEditorWrapper.classList.add("hidden");
});

cssEditorTab.addEventListener("click", () => {
  activeEditor = "css";
  markdownEditorTab.classList.remove("tab-active");
  cssEditorTab.classList.remove("tab-inactive");

  markdownEditorTab.classList.add("tab-inactive");
  cssEditorTab.classList.add("tab-active");

  markdownEditorWrapper.classList.add("hidden");
  cssEditorWrapper.classList.remove("hidden");
});

// Event Listeners for buttons
togglePreviewButton.addEventListener("click", () => {
  if (previewContainer.classList.contains("hidden")) {
    previewContainer.classList.remove("hidden");
    editorContainer.classList.remove("w-full");
    editorContainer.classList.add("w-1/2");
  } else {
    editorContainer.classList.remove("w-1/2");
    editorContainer.classList.add("w-full");
    previewContainer.classList.add("hidden");
  }
});

updateDocumentBtn.addEventListener("click", () => {
  const newTitle = updateDocumentInput.value;
  if (newTitle && newTitle.trim() != "") {
    resume.title = newTitle;
    resumeTitleElement.textContent = newTitle;
    saveResume(resume);
    myModal.classList.add("hidden");
  } else {
    alert("Please provide a valid name.");
  }
});

downloadMarkdownBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.hidden = true;
  link.href =
    "data:text/plain;charset=utf-8," + encodeURIComponent(resume.content);
  link.download = `${resume.title}.md`;
  link.click();
  link.remove();
});

downloadPdfBtn.addEventListener("click", () => {
  downloadPdfBtn.disabled = true;
  get_pdf(resume)
    .catch((e) => {
      console.error(e);
      alert("Something went wrong.");
    })
    .finally(() => {
      downloadPdfBtn.disabled = false;
    });
});

deleteButton.addEventListener("click", () => {
  deleteResume(id);
  window.location.href = "/dashboard.html";
});

function updatePreview(content) {
  const parsedResume = marked(content);
  resumeContent.innerHTML = parsedResume;
}

function injectResumeStyles(styles) {
  const stylesEl = document.getElementById("injected-styles");
  if (!stylesEl) {
    const newStyles = document.createElement("style");
    newStyles.id = "injected-styles";
    newStyles.type = "text/css";
    newStyles.innerHTML = resume.css;
    document.head.appendChild(newStyles);
  } else {
    stylesEl.innerHTML = resume.css;
  }
}

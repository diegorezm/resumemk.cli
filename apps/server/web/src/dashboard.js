import { setupModal } from "./modal.js";
import {
  getResumes,
  saveResume,
  deleteResume,
  generateResumeId,
  DEFAULT_RESUME,
  DEFAULT_STYLES,
} from "/resume_store.js";
import { get_pdf } from "/request.js";
const createDocumentBtn = document.getElementById("create_document_btn");
const documentNameInput = document.getElementById("document_name");
const useTemplateInput = document.getElementById("use_template");
const resumesContainer = document.getElementById("resumes_container");
const myModal = document.getElementById("my_modal");
let resumes = getResumes();

setupModal();

createDocumentBtn.addEventListener("click", () => {
  const documentName = documentNameInput.value;
  const useTemplate = useTemplateInput.checked;
  if (documentName && documentName.trim() !== "") {
    const docId = generateResumeId();
    const resume = {
      id: docId,
      title: documentName,
      content: useTemplate ? DEFAULT_RESUME : "",
      css: useTemplate ? DEFAULT_STYLES : "",
    };

    saveResume(resume);
    resumes.push(resume);
    documentNameInput.value = "";
    displayResumes();
    myModal.classList.add("hidden");
  } else {
    alert("Please enter a document name.");
  }
});

function displayResumes() {
  resumesContainer.innerHTML = "";
  if (!resumes || resumes.length === 0) {
    resumesContainer.innerHTML =
      "<p class='text-gray-500 text-center'>No resumes created yet.</p>";
    return;
  }

  resumes.forEach((resume) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "bg-card",
      "rounded-lg",
      "shadow-md",
      "flex",
      "justify-between",
      "items-center",
    );

    const previewContent = resume.content.substring(0, 250);
    const preview = `<p class="text-gray-700">${previewContent}${previewContent.length > 0 ? "..." : ""}</p>`;

    const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
    const viewIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;
    const downloadIcon = `<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-download-icon lucide-download"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            `;

    listItem.innerHTML = `
              <div>
                <nav class="flex justify-between items-center text-lg py-2 bg-primary text-on-primary rounded-t-lg px-4">
                  <h3 class="font-bold">${resume.title}</h3>
                  <div class="flex">
                    <button class="btn btn-sm text-on-tertiary btn-download-resume" data-id="${resume.id}">${downloadIcon}</button>
                    <button class="btn btn-sm text-on-tertiary btn-remove-resume" data-id="${resume.id}">${trashIcon}</button>
                    <a class="btn btn-sm text-on-tertiary" href="/resume.html?id=${resume.id}">${viewIcon}</a>
                  </div>
                </nav>
                <div class="bg-surface text-on-surface py-2">
                  ${preview}
                </div>
              </div>
          `;

    resumesContainer.appendChild(listItem);

    const downlaodButtons = document.querySelectorAll(".btn-download-resume");
    downlaodButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        button.disabled = true;
        get_pdf(resume)
          .then(() => {
            button.disabled = false;
          })
          .catch((e) => {
            console.error(e);
            alert("Something went wrong.");
            button.disabled = false;
          });
      });
    });

    const deleteButtons = document.querySelectorAll(".btn-remove-resume");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        deleteResume(resume.id);
        resumes = getResumes();
        displayResumes();
      });
    });
  });
}
displayResumes();

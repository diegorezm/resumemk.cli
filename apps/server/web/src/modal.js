import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
/**
 * Sets up a modal with open, close, and backdrop functionalities.
 * @param {function} [onClose] Function that executes when the modal is closed.
 */
export function setupModal(onClose) {
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const closeModalBtns = document.querySelectorAll(".close-modal-btn");
  const modal = document.getElementById("my_modal");

  if (!openModalBtns || !modal) {
    console.error("One or more modal elements not found.");
    return;
  }

  modal.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.add("hidden");
      if (onClose) {
        onClose();
      }
    });
  });
}

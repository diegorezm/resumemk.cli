/**
 * Sets up a modal with open, close, and backdrop functionalities.
 *
 * @param {Object} [options] - Configuration object.
 * @param {function} [options.onOpen] - Function that executes when the modal is opened.
 * @param {function} [options.onClose] - Function that executes when the modal is closed.
 */
export function setupModal({ onOpen, onClose } = {}) {
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const closeModalBtns = document.querySelectorAll(".close-modal-btn");
  const modal = document.getElementById("my_modal");

  modal.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      modal.classList.toggle("hidden");
    }

  })

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
      if (onOpen) {
        onOpen()
      }
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

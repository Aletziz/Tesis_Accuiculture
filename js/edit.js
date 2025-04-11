document.addEventListener("DOMContentLoaded", function () {
  const isAdmin = localStorage.getItem("adminToken") === "true";

  if (isAdmin) {
    // Add edit functionality to all content areas
    const editableSelectors = [
      // Main content selectors
      ".chapter-content",
      ".section-content",
      ".introduction-content",
      ".methodology-content",
      ".chapter-title",
      ".section-title",
      ".chapter-description",
      ".section-description",

      // Introduction page
      ".introduction-text",
      ".intro-content",
      ".intro-title",

      // Chapter pages
      ".chapter-main-content",
      ".chapter-subtitle",
      ".chapter-text",

      // Section pages
      ".section-main-content",
      ".section-text",
      ".subsection-content",

      // General content
      "p:not(.nav-text)",
      "h1:not(.nav-title)",
      "h2:not(.nav-title)",
      "h3:not(.nav-title)",
      ".content-text",
    ];

    editableSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (
          !element.closest(".edit-controls") &&
          !element.closest(".editable-wrapper") &&
          !element.closest("nav")
        ) {
          makeEditable(element);
        }
      });
    });

    // Add admin indicator
    const adminIndicator = document.createElement("div");
    adminIndicator.className = "admin-mode-indicator";
    adminIndicator.innerHTML = '<i class="fas fa-edit"></i> Modo Edición';
    document.body.appendChild(adminIndicator);
  }
});

function makeEditable(element) {
  if (
    element.closest(".editable-wrapper") ||
    element.querySelector(".edit-controls")
  ) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "editable-wrapper";

  const editButton = document.createElement("button");
  editButton.className = "edit-button";
  editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';

  let isEditing = false;

  editButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isEditing) {
      element.contentEditable = true;
      element.classList.add("editing");
      editButton.innerHTML = '<i class="fas fa-save"></i> Guardar';
      isEditing = true;
    } else {
      element.contentEditable = false;
      element.classList.remove("editing");
      editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
      isEditing = false;

      // Save to localStorage with page identifier
      const pageId = window.location.pathname.replace(/\//g, "_");
      const contentId = `${pageId}_${element.className}_${Date.now()}`;
      const savedContent = JSON.parse(localStorage.getItem("content") || "{}");
      savedContent[contentId] = element.innerHTML;
      localStorage.setItem("content", JSON.stringify(savedContent));

      showSaveToast();
    }
  });

  const controls = document.createElement("div");
  controls.className = "edit-controls";
  controls.appendChild(editButton);

  element.classList.add("editable-content");
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(controls);
  wrapper.appendChild(element);
}

function showSaveToast() {
  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = "Cambios guardados exitosamente";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

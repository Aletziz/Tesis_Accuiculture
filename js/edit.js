document.addEventListener("DOMContentLoaded", function () {
  const isAdmin = localStorage.getItem("adminToken") === "true";
  
  // Verificar si estamos en el Capítulo 6
  const isChapter6 = window.location.pathname.includes('capitulo6.html');
  
  if (isAdmin && !isChapter6) {  // Solo agregar funcionalidad de edición si no es Capítulo 6
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
          !element.closest("nav") &&
          !element.closest(".navigation-buttons") &&
          !element.closest(".back-link")
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

    // Asegurar que los botones y enlaces funcionen correctamente
    document.querySelectorAll('.nav-button, .back-link, .section-button, a, button').forEach(element => {
      element.style.pointerEvents = 'auto';
      element.style.cursor = 'pointer';
    });
  }
});

function makeEditable(element) {
  element.contentEditable = true;
  element.classList.add('editable-content');
  
  // Prevenir que la edición interfiera con los clicks en enlaces y botones
  element.addEventListener('click', function(e) {
    if (e.target.closest('a') || e.target.closest('button')) {
      e.stopPropagation();
    }
  });
}

function showSaveToast() {
  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = "Cambios guardados exitosamente";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

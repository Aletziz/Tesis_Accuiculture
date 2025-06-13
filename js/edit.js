document.addEventListener("DOMContentLoaded", function () {
  const isAdmin = localStorage.getItem("adminToken") === "true";
  
  // Verificar si estamos en el Capítulo 6
  const isChapter6 = window.location.pathname.includes('capitulo6.html');
  
  // Remover modo de edición si no es admin
  if (!isAdmin) {
    document.querySelectorAll('[contenteditable="true"]').forEach(element => {
      element.contentEditable = false;
      element.classList.remove('editable-content');
    });
    return;
  }
  
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

// Función para hacer elementos editables
function makeEditable(element) {
  const isAdmin = localStorage.getItem("adminToken") === "true";
  if (!isAdmin) {
    element.contentEditable = false;
    element.classList.remove('editable-content');
    return;
  }

  element.contentEditable = true;
  element.classList.add('editable-content');
  
  // Prevenir que la edición interfiera con los clicks en enlaces y botones
  element.addEventListener('click', function(e) {
    if (e.target.closest('a') || e.target.closest('button')) {
      e.stopPropagation();
    }
  });
}

// Función para manejar el cierre de sesión
function handleLogout() {
  localStorage.removeItem("adminToken");
  // Remover modo de edición de todos los elementos
  document.querySelectorAll('[contenteditable="true"]').forEach(element => {
    element.contentEditable = false;
    element.classList.remove('editable-content');
  });
  // Remover indicador de modo admin
  const adminIndicator = document.querySelector('.admin-mode-indicator');
  if (adminIndicator) {
    adminIndicator.remove();
  }
  // Redirigir a la página de inicio
  window.location.href = 'index.html';
}

function showSaveToast() {
  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = "Cambios guardados exitosamente";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

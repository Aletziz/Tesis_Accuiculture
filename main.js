document.addEventListener("DOMContentLoaded", function () {
  const isAdmin = localStorage.getItem("adminToken") === "true";

  if (isAdmin) {
    // Agregar botón de cerrar sesión
    const navMenu = document.querySelector(".nav-menu");
    const logoutButton = document.createElement("li");
    logoutButton.className = "nav-item";
    logoutButton.innerHTML = `
      <button onclick="handleLogout()" class="logout-button">
        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
      </button>
    `;
    navMenu.appendChild(logoutButton);

    // Hacer elementos editables
    const editableSelectors = [
      "h1",
      "h2",
      "h3",
      "p",
      "small",
      ".chapter-text",
      ".section-text",
      ".gallery-caption",
      ".video-item h3",
      ".video-item p",
      ".author-info",
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
  }
});

function makeEditable(element) {
  // Check if element is already editable
  if (element.closest(".editable-wrapper")) {
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

      // Save content
      const contentId = element.id || `content-${Date.now()}`;
      const savedContent = JSON.parse(localStorage.getItem("content") || "{}");
      savedContent[contentId] = element.innerHTML;
      localStorage.setItem("content", JSON.stringify(savedContent));

      // Show success message
      const toast = document.createElement("div");
      toast.className = "save-toast";
      toast.textContent = "Cambios guardados exitosamente";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
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

function enableEditing(button, event) {
  event.preventDefault();
  event.stopPropagation();

  const wrapper = button.closest(".editable-wrapper");
  const content = wrapper.querySelector(".editable-content");

  content.contentEditable = true;
  content.classList.add("editing");
  button.style.display = "none";
  button.nextElementSibling.style.display = "inline-flex";
}

function saveEditing(button, event) {
  event.preventDefault();
  event.stopPropagation();

  const wrapper = button.closest(".editable-wrapper");
  const content = wrapper.querySelector(".editable-content");
  const contentHtml = content.innerHTML;
  const contentId = content.id || `content-${Date.now()}`;

  content.contentEditable = false;
  content.classList.remove("editing");
  button.style.display = "none";
  button.previousElementSibling.style.display = "inline-flex";

  const savedContent = JSON.parse(localStorage.getItem("content") || "{}");
  savedContent[contentId] = contentHtml;
  localStorage.setItem("content", JSON.stringify(savedContent));

  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = "Cambios guardados exitosamente";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function handleLogout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin.html";
}

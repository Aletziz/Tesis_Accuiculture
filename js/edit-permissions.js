// Función para verificar permisos de edición
function checkEditPermissions() {
    const isAdmin = localStorage.getItem("adminToken") === "true";
    
    if (!isAdmin) {
        // Deshabilitar edición en todos los elementos
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            element.contentEditable = false;
            element.classList.remove('editable-content');
            element.style.border = 'none';
        });
        return false;
    }
    
    return true;
}

// Función para hacer elementos editables
function makeEditable(element) {
    if (!checkEditPermissions()) return;
    
    if (element.contentEditable === "true") {
        element.contentEditable = "false";
        element.style.border = "none";
        if (element.previousElementSibling && element.previousElementSibling.classList.contains('edit-button')) {
            element.previousElementSibling.innerHTML = "Editar";
        }
    } else {
        element.contentEditable = "true";
        element.style.border = "2px dashed #007bff";
        if (element.previousElementSibling && element.previousElementSibling.classList.contains('edit-button')) {
            element.previousElementSibling.innerHTML = "Guardar";
        }
    }
}

// Función para agregar botones de edición
function addEditButtons() {
    if (!checkEditPermissions()) return;
    
    const editableSelectors = [
        ".chapter-text",
        ".content-section",
        ".editable-content",
        ".chapter-content",
        ".section-content",
        ".introduction-content",
        ".methodology-content",
        ".chapter-title",
        ".section-title",
        ".chapter-description",
        ".section-description",
        ".intro-content",
        ".intro-title",
        ".chapter-main-content",
        ".chapter-subtitle",
        ".section-main-content",
        ".section-text",
        ".subsection-content",
        "p:not(.nav-text)",
        "h1:not(.nav-title)",
        "h2:not(.nav-title)",
        "h3:not(.nav-title)",
        ".content-text"
    ];
    
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            if (
                !element.closest(".edit-controls") &&
                !element.closest(".editable-wrapper") &&
                !element.closest("nav") &&
                !element.closest(".navigation-buttons") &&
                !element.closest(".back-link") &&
                !element.previousElementSibling?.classList.contains('edit-button')
            ) {
                const editBtn = document.createElement("button");
                editBtn.className = "edit-button";
                editBtn.innerHTML = "Editar";
                editBtn.onclick = () => makeEditable(element);
                element.parentNode.insertBefore(editBtn, element);
            }
        });
    });
}

// Función para manejar el cierre de sesión
function handleLogout() {
    localStorage.removeItem("adminToken");
    checkEditPermissions();
    window.location.href = "index.html";
}

// Verificar permisos al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    checkEditPermissions();
    addEditButtons();
});

// Verificar permisos cada vez que se carga la página
window.addEventListener('load', function() {
    checkEditPermissions();
    addEditButtons();
}); 
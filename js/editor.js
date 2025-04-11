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

    // Elementos editables
    const editableSelectors = [
      ".intro-highlight p",
      ".intro-content p",
      ".editable-text",
      "h1:not(.nav-logo)",
      ".intro-title",
    ];

    editableSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!element.closest(".edit-controls")) {
          hacerEditable(element);
        }
      });
    });
  }
});

function hacerEditable(elemento) {
  const contenedor = document.createElement("div");
  contenedor.className = "contenedor-editable";

  const botonEditar = document.createElement("button");
  botonEditar.className = "boton-editar";
  botonEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
  botonEditar.style.display = "block"; // Hacer visible el botón
  botonEditar.style.opacity = "1"; // Asegurar que sea visible

  let editando = false;

  botonEditar.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editando) {
      elemento.contentEditable = true;
      elemento.classList.add("editando");
      botonEditar.innerHTML = '<i class="fas fa-save"></i> Guardar';
      editando = true;
    } else {
      elemento.contentEditable = false;
      elemento.classList.remove("editando");
      botonEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
      editando = false;
      guardarCambios(elemento);
    }
  });

  contenedor.appendChild(botonEditar);
  elemento.parentNode.insertBefore(contenedor, elemento);
  contenedor.appendChild(elemento);
}

function guardarCambios(elemento) {
  const pagina = window.location.pathname;
  const id = `${pagina}_${Date.now()}`;
  const contenidoGuardado = JSON.parse(
    localStorage.getItem("contenido") || "{}"
  );

  contenidoGuardado[id] = {
    contenido: elemento.innerHTML,
    fecha: new Date().toISOString(),
    pagina: pagina,
  };

  localStorage.setItem("contenido", JSON.stringify(contenidoGuardado));
  mostrarNotificacion();
}

function mostrarNotificacion() {
  const notificacion = document.createElement("div");
  notificacion.className = "notificacion-guardado";
  notificacion.textContent = "Cambios guardados exitosamente";
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}

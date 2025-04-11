// Verificar si el usuario está logueado
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  document.body.classList.toggle("logged-in", isLoggedIn);

  if (isLoggedIn) {
    const editButtons = document.querySelectorAll(".edit-controls");
    editButtons.forEach((btn) => (btn.style.display = "flex"));
  }
}

// Función para habilitar la edición
function enableEditing(element) {
  element.contentEditable = true;
  element.focus();
  element.classList.add("editing");
}

// Función para guardar cambios
function saveChanges(element) {
  element.contentEditable = false;
  element.classList.remove("editing");
  // Aquí agregarías la lógica para guardar en la base de datos
  localStorage.setItem(element.id, element.innerHTML);
  alert("Cambios guardados");
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.reload();
}

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  // Cargar contenido guardado
  document.querySelectorAll("[id]").forEach((element) => {
    const savedContent = localStorage.getItem(element.id);
    if (savedContent) {
      element.innerHTML = savedContent;
    }
  });
});

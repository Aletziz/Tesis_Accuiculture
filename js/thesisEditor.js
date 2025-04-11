document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("adminToken") === "true") {
    // Add admin bar
    const adminBar = document.createElement("div");
    adminBar.className = "admin-bar";
    adminBar.innerHTML = `
      <span><i class="fas fa-user"></i> Modo Admin</span>
      <button onclick="handleLogout()" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
      </button>
    `;
    document.body.insertBefore(adminBar, document.body.firstChild);
    document.body.classList.add("admin-mode");
  }
});

function handleLogout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin.html";
}

window.handleLogout = handleLogout;

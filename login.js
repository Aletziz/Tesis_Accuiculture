document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Credenciales hardcodeadas (en un caso real, esto estaría en el servidor)
  if (username === "admin" && password === "password123") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "index.html";
  } else {
    alert("Credenciales incorrectas");
  }
});

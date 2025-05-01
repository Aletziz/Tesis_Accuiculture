const fs = require('fs');
const path = require('path');

// Plantilla del encabezado HTML
const headerTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tesis Acuicultura</title>
    <link rel="stylesheet" href="css/modern-styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="css/thesisEditor.css">
    <script src="js/thesisEditor.js"></script>
    <script src="js/page-transitions.js" defer></script>
</head>`;

// Plantilla de la barra de navegación
const navTemplate = `<nav class="navbar">
    <div class="nav-container">
        <a href="index.html" class="nav-logo">Tesis Acuicultura</a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
            <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-menu" id="navMenu">
            <li><a href="index.html">Inicio</a></li>
            <li><a href="galeria.html">Galería</a></li>
            <li><a href="audiovisuales.html">Audiovisuales</a></li>
            <li><a href="contacto.html">Contacto</a></li>
            <li><a href="admin.html">Admin</a></li>
        </ul>
    </div>
</nav>`;

// Plantilla del script
const scriptTemplate = `<script>
    // Mejorar la navegación móvil
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    
    navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        const icon = navToggle.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
    });

    // Cerrar el menú al hacer clic en un enlace
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            const icon = navToggle.querySelector("i");
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-times");
        });
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
            const icon = navToggle.querySelector("i");
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-times");
        }
    });

    // Verificar si es administrador
    document.addEventListener("DOMContentLoaded", function() {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        
        if (isAdmin) {
            const nav = document.querySelector(".nav-menu");
            const logoutBtn = document.createElement("li");
            logoutBtn.innerHTML = '<a href="#" onclick="logout()">Cerrar Sesión</a>';
            nav.appendChild(logoutBtn);
            
            document.querySelectorAll(".editable-content").forEach(element => {
                const editBtn = document.createElement("button");
                editBtn.className = "edit-button";
                editBtn.innerHTML = "Editar";
                editBtn.onclick = () => makeEditable(element);
                element.parentNode.insertBefore(editBtn, element);
            });
        }
    });

    function makeEditable(element) {
        if (element.contentEditable === "true") {
            element.contentEditable = "false";
            element.style.border = "none";
            element.previousElementSibling.innerHTML = "Editar";
        } else {
            element.contentEditable = "true";
            element.style.border = "2px dashed #007bff";
            element.previousElementSibling.innerHTML = "Guardar";
        }
    }

    function logout() {
        localStorage.removeItem("isAdmin");
        window.location.reload();
    }
</script>`;

// Función para actualizar un archivo HTML
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer el contenido principal (entre <main> y </main>)
    const mainContentMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    let mainContent = mainContentMatch ? mainContentMatch[0] : '';
    
    if (!mainContent) {
        // Si no hay etiqueta main, extraer el contenido del body
        const bodyContentMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyContentMatch ? bodyContentMatch[1] : '';
        // Envolver el contenido en etiquetas main
        mainContent = `<main class="main-content">${bodyContent}</main>`;
    }
    
    // Crear el nuevo contenido del archivo
    const newContent = `${headerTemplate}
<body>
    ${navTemplate}
    ${mainContent}
    ${scriptTemplate}
</body>
</html>`;
    
    // Guardar el archivo actualizado
    fs.writeFileSync(filePath, newContent, 'utf8');
}

// Función para buscar archivos HTML recursivamente
function findHtmlFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results = results.concat(findHtmlFiles(filePath));
        } else if (path.extname(file).toLowerCase() === '.html') {
            results.push(filePath);
        }
    }
    
    return results;
}

// Directorio del proyecto
const projectDir = '.';

// Encontrar y actualizar todos los archivos HTML
const htmlFiles = findHtmlFiles(projectDir);
htmlFiles.forEach(file => {
    console.log(`Actualizando: ${file}`);
    updateHtmlFile(file);
}); 
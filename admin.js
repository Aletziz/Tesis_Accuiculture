document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginContainer = document.getElementById("loginContainer");
  const adminPanel = document.getElementById("adminPanel");
  const fileList = document.getElementById("fileList");
  const editorContainer = document.getElementById("editorContainer");
  const editorContent = document.getElementById("editorContent");
  const saveButton = document.getElementById("saveButton");
  const logoutButton = document.getElementById("logoutButton");
  const currentFile = document.getElementById("currentFile");

  let currentFilePath = "";
  let originalContent = "";

  // Verificar si el usuario ya está autenticado
  if (localStorage.getItem("isAdmin") === "true") {
    showAdminPanel();
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Credenciales hardcodeadas (en producción deberían estar en el servidor)
    if (username === "admin" && password === "tesis2024") {
      localStorage.setItem("isAdmin", "true");
      showAdminPanel();
    } else {
      alert("Credenciales incorrectas");
    }
  });

  logoutButton.addEventListener("click", function() {
    localStorage.removeItem("isAdmin");
    loginContainer.style.display = "flex";
    adminPanel.style.display = "none";
  });

  function showAdminPanel() {
    loginContainer.style.display = "none";
    adminPanel.style.display = "block";
    loadFileList();
  }

  function loadFileList() {
    // Obtener lista de archivos HTML
    fetch("/api/files")
      .then(response => response.json())
      .then(files => {
        fileList.innerHTML = "<h2>Archivos Disponibles</h2>";
        files.forEach(file => {
          if (file.endsWith(".html")) {
            const fileItem = document.createElement("div");
            fileItem.className = "file-item";
            fileItem.textContent = file;
            fileItem.addEventListener("click", () => loadFile(file));
            fileList.appendChild(fileItem);
          }
        });
      })
      .catch(error => {
        console.error("Error al cargar la lista de archivos:", error);
        fileList.innerHTML = "<p>Error al cargar los archivos</p>";
      });
  }

  function loadFile(filePath) {
    currentFilePath = filePath;
    currentFile.textContent = `Editando: ${filePath}`;
    
    fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`)
      .then(response => response.text())
      .then(content => {
        originalContent = content;
        
        // Crear un parser de HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Encontrar el contenido principal (main o div con clase content)
        const mainContent = doc.querySelector('main') || doc.querySelector('.content') || doc.querySelector('article') || doc.querySelector('.container');
        
        if (mainContent) {
          // Si encontramos el contenido principal, lo mostramos para edición
          editorContent.innerHTML = `
            <div class="content-editor">
              <h3>Editando Contenido Principal</h3>
              <div class="editor-section">
                ${mainContent.outerHTML}
              </div>
            </div>
          `;
          
          // Hacer que todo el contenido sea editable
          const contentElements = editorContent.querySelectorAll('.editor-section *');
          contentElements.forEach(element => {
            if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
              element.contentEditable = true;
            }
          });
        } else {
          // Si no encontramos un contenedor específico, mostrar el contenido completo
          editorContent.innerHTML = content;
          
          // Hacer que todo el contenido sea editable
          const allElements = editorContent.querySelectorAll('*');
          allElements.forEach(element => {
            if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
              element.contentEditable = true;
            }
          });
        }
        
        editorContainer.style.display = "block";
      })
      .catch(error => {
        console.error("Error al cargar el archivo:", error);
        alert("Error al cargar el archivo");
      });
  }

  saveButton.addEventListener("click", function() {
    if (!currentFilePath) return;

    // Si estamos editando contenido específico, necesitamos actualizar el contenido original
    let contentToSave = editorContent.innerHTML;
    
    // Si el contenido contiene el content-editor, necesitamos extraer solo el contenido editado
    if (contentToSave.includes('content-editor')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentToSave, 'text/html');
      const editedContent = doc.querySelector('.editor-section > *');
      
      if (editedContent) {
        // Reemplazar el contenido en el documento original
        const originalDoc = parser.parseFromString(originalContent, 'text/html');
        const mainContent = originalDoc.querySelector('main') || 
                           originalDoc.querySelector('.content') || 
                           originalDoc.querySelector('article') || 
                           originalDoc.querySelector('.container');
        
        if (mainContent) {
          mainContent.outerHTML = editedContent.outerHTML;
          contentToSave = originalDoc.documentElement.outerHTML;
        }
      }
    }

    fetch("/api/save-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: currentFilePath,
        content: contentToSave
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert("Archivo guardado exitosamente");
      } else {
        alert("Error al guardar el archivo");
      }
    })
    .catch(error => {
      console.error("Error al guardar el archivo:", error);
      alert("Error al guardar el archivo");
    });
  });
});

function formatText(command) {
  document.execCommand(command, false, null);
}

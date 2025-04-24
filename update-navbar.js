import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir la estructura del navbar que queremos usar en todos los archivos
const navbarHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="nav-logo">Tesis Acuicultura</a>
        <button class="nav-toggle" id="navToggle">
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

// Función para actualizar el navbar en un archivo HTML
async function updateNavbarInFile(filePath) {
  try {
    // Leer el contenido del archivo
    const content = await fs.readFile(filePath, 'utf8');
    
    // Buscar el navbar actual usando una expresión regular
    const navbarRegex = /<nav class="navbar">[\s\S]*?<\/nav>/;
    
    // Reemplazar el navbar actual con el nuevo
    const updatedContent = content.replace(navbarRegex, navbarHTML);
    
    // Escribir el contenido actualizado en el archivo
    await fs.writeFile(filePath, updatedContent, 'utf8');
    
    console.log(`Navbar actualizado en: ${filePath}`);
  } catch (error) {
    console.error(`Error al actualizar el navbar en ${filePath}:`, error);
  }
}

// Función para encontrar todos los archivos HTML en el directorio
async function findHtmlFiles(dir) {
  const files = await fs.readdir(dir);
  const htmlFiles = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      // Excluir directorios que no queremos procesar
      if (!['node_modules', '.git', 'public', 'src', 'supabase', 'para Adrían'].includes(file)) {
        const subDirHtmlFiles = await findHtmlFiles(filePath);
        htmlFiles.push(...subDirHtmlFiles);
      }
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  }
  
  return htmlFiles;
}

// Función principal
async function main() {
  try {
    console.log('Buscando archivos HTML...');
    const htmlFiles = await findHtmlFiles(__dirname);
    console.log(`Se encontraron ${htmlFiles.length} archivos HTML.`);
    
    console.log('Actualizando navbar en todos los archivos...');
    for (const file of htmlFiles) {
      await updateNavbarInFile(file);
    }
    
    console.log('¡Proceso completado!');
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Ejecutar la función principal
main(); 
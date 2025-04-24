import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para actualizar la contraseña de MongoDB en el archivo .env
const updateMongoDBPassword = async () => {
  try {
    console.log('Actualización de contraseña de MongoDB en el archivo .env');
    console.log('--------------------------------------------------------');
    
    // Leer el archivo .env
    const envPath = join(__dirname, '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      console.error('Error al leer el archivo .env:', error.message);
      console.log('Creando un nuevo archivo .env...');
      envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://galexito856:<db_password>@tesis.bhhr20s.mongodb.net/?retryWrites=true&w=majority&appName=Tesis

# Server Configuration
PORT=8080
NODE_ENV=development
`;
    }
    
    // Verificar si ya existe una contraseña
    const hasPassword = !envContent.includes('<db_password>');
    
    if (hasPassword) {
      console.log('Ya existe una contraseña configurada en el archivo .env');
      rl.question('¿Deseas actualizarla? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          await promptForPassword(envContent, envPath);
        } else {
          console.log('Operación cancelada');
          rl.close();
        }
      });
    } else {
      await promptForPassword(envContent, envPath);
    }
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
};

// Función para solicitar la contraseña al usuario
const promptForPassword = async (envContent, envPath) => {
  rl.question('Ingresa la contraseña de MongoDB Atlas: ', async (password) => {
    if (!password) {
      console.log('La contraseña no puede estar vacía');
      rl.close();
      return;
    }
    
    // Actualizar la contraseña en el contenido
    const updatedContent = envContent.replace(/<db_password>/, password);
    
    // Guardar el archivo actualizado
    try {
      await fs.writeFile(envPath, updatedContent, 'utf8');
      console.log('Contraseña actualizada correctamente en el archivo .env');
    } catch (error) {
      console.error('Error al guardar el archivo .env:', error.message);
    }
    
    rl.close();
  });
};

// Ejecutar la función principal
updateMongoDBPassword(); 
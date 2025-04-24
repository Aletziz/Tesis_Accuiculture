import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import readline from 'readline';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Función principal
const setupMongoDB = async () => {
  try {
    console.log('=== Configuración de MongoDB ===');
    console.log('Este script te ayudará a configurar la conexión a MongoDB.');
    console.log('--------------------------------------------------------');
    
    // Paso 1: Verificar si el archivo .env existe
    const envPath = join(__dirname, '.env');
    let envExists = true;
    
    try {
      await fs.access(envPath);
    } catch (error) {
      envExists = false;
    }
    
    if (!envExists) {
      console.log('El archivo .env no existe. Creando uno nuevo...');
      await createEnvFile(envPath);
    }
    
    // Paso 2: Verificar si la contraseña de MongoDB está configurada
    const envContent = await fs.readFile(envPath, 'utf8');
    const hasPassword = !envContent.includes('<db_password>');
    
    if (!hasPassword) {
      console.log('La contraseña de MongoDB no está configurada.');
      await updateMongoDBPassword(envContent, envPath);
    } else {
      console.log('La contraseña de MongoDB ya está configurada.');
      const update = await question('¿Deseas actualizarla? (s/n): ');
      
      if (update.toLowerCase() === 's') {
        await updateMongoDBPassword(envContent, envPath);
      }
    }
    
    // Paso 3: Probar la conexión a MongoDB
    console.log('\nProbando la conexión a MongoDB...');
    await testMongoDBConnection();
    
    console.log('\nConfiguración completada.');
    rl.close();
    
  } catch (error) {
    console.error('Error durante la configuración:', error.message);
    rl.close();
  }
};

// Función para crear el archivo .env
const createEnvFile = async (envPath) => {
  const defaultEnvContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://galexito856:<db_password>@tesis.bhhr20s.mongodb.net/?retryWrites=true&w=majority&appName=Tesis

# Server Configuration
PORT=8080
NODE_ENV=development
`;
  
  await fs.writeFile(envPath, defaultEnvContent, 'utf8');
  console.log('Archivo .env creado correctamente.');
};

// Función para actualizar la contraseña de MongoDB
const updateMongoDBPassword = async (envContent, envPath) => {
  const password = await question('Ingresa la contraseña de MongoDB Atlas: ');
  
  if (!password) {
    console.log('La contraseña no puede estar vacía');
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
};

// Función para probar la conexión a MongoDB
const testMongoDBConnection = async () => {
  try {
    // Ejecutar el script de prueba
    const { stdout, stderr } = await execAsync('node test-mongodb.js');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
  } catch (error) {
    console.error('Error al probar la conexión:', error.message);
  }
};

// Ejecutar la función principal
setupMongoDB(); 
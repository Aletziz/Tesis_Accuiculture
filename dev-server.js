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
const startDevServer = async () => {
  try {
    console.log('=== Iniciando servidor en modo desarrollo ===');
    console.log('Este modo te permitirá trabajar sin necesidad de una conexión a MongoDB.');
    console.log('--------------------------------------------------------');
    
    // Verificar si el archivo .env existe
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
    
    // Verificar y actualizar NODE_ENV
    const envContent = await fs.readFile(envPath, 'utf8');
    let updatedContent = envContent;
    
    if (envContent.includes('NODE_ENV=production')) {
      console.log('Actualizando NODE_ENV a development...');
      updatedContent = envContent.replace(/NODE_ENV=production/, 'NODE_ENV=development');
      await fs.writeFile(envPath, updatedContent, 'utf8');
      console.log('NODE_ENV actualizado correctamente.');
    }
    
    // Preguntar si desea ejecutar get-ip.js
    const runGetIP = await question('\n¿Deseas obtener tu dirección IP para añadirla a la lista blanca de MongoDB Atlas? (s/n): ');
    
    if (runGetIP.toLowerCase() === 's') {
      console.log('\nEjecutando get-ip.js...');
      try {
        const { stdout, stderr } = await execAsync('node get-ip.js');
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error('Error al ejecutar get-ip.js:', error.message);
      }
    }
    
    // Iniciar el servidor
    console.log('\nIniciando el servidor en modo desarrollo...');
    console.log('Presiona Ctrl+C para detener el servidor.');
    
    // Ejecutar el servidor
    const serverProcess = exec('node server.js');
    
    // Mostrar la salida del servidor
    serverProcess.stdout.on('data', (data) => {
      console.log(data);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data);
    });
    
    // Manejar la terminación del proceso
    serverProcess.on('close', (code) => {
      console.log(`Servidor terminado con código: ${code}`);
      rl.close();
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
};

// Función para crear el archivo .env
const createEnvFile = async (envPath) => {
  const defaultEnvContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://galexito856:kirito123@tesis.bhhr20s.mongodb.net/?retryWrites=true&w=majority&appName=Tesis

# Server Configuration
PORT=8080
NODE_ENV=development
`;
  
  await fs.writeFile(envPath, defaultEnvContent, 'utf8');
  console.log('Archivo .env creado correctamente.');
};

// Ejecutar la función principal
startDevServer(); 
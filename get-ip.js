import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Función para obtener la dirección IP pública
const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// Función principal
const main = async () => {
  try {
    console.log('=== Obteniendo tu dirección IP pública ===');
    console.log('Esto te ayudará a añadir tu IP a la lista blanca de MongoDB Atlas.');
    console.log('--------------------------------------------------------');
    
    const ip = await getPublicIP();
    console.log(`Tu dirección IP pública es: ${ip}`);
    console.log('\nPara añadir esta IP a la lista blanca de MongoDB Atlas:');
    console.log('1. Inicia sesión en MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('2. Selecciona tu cluster "Tesis"');
    console.log('3. En el menú lateral, haz clic en "Network Access"');
    console.log('4. Haz clic en "Add IP Address"');
    console.log('5. Selecciona "Add Current IP Address" o ingresa manualmente:');
    console.log(`   ${ip}/32`);
    console.log('6. Haz clic en "Confirm"');
    console.log('\nDespués de añadir tu IP, intenta conectar nuevamente a MongoDB.');
    
    // Preguntar si desea actualizar el archivo .env
    const updateEnv = await question('\n¿Deseas actualizar el archivo .env para modo desarrollo? (s/n): ');
    
    if (updateEnv.toLowerCase() === 's') {
      await updateEnvFile();
    }
    
    rl.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
};

// Función para actualizar el archivo .env
const updateEnvFile = async () => {
  try {
    const envPath = join(__dirname, '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      console.error('Error al leer el archivo .env:', error.message);
      return;
    }
    
    // Actualizar NODE_ENV a development
    const updatedContent = envContent.replace(/NODE_ENV=production/, 'NODE_ENV=development');
    
    // Guardar el archivo actualizado
    await fs.writeFile(envPath, updatedContent, 'utf8');
    console.log('Archivo .env actualizado para modo desarrollo.');
    
  } catch (error) {
    console.error('Error al actualizar el archivo .env:', error.message);
  }
};

// Ejecutar la función principal
main(); 
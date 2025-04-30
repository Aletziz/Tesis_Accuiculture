import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';
import { promisify } from 'util';
import https from 'https';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv
dotenv.config();

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Función para resolver DNS
const resolveDNS = promisify(dns.resolve);

// Función para verificar la conectividad con un host
const checkHostConnectivity = (host) => {
  return new Promise((resolve) => {
    const req = https.get(`https://${host}`, (res) => {
      resolve({
        host,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 300
      });
    });
    
    req.on('error', () => {
      resolve({
        host,
        status: 'error',
        ok: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        host,
        status: 'timeout',
        ok: false
      });
    });
  });
};

// Función principal
const checkMongoDBConnection = async () => {
  try {
    console.log('=== Verificación de conexión a MongoDB Atlas ===');
    console.log('Este script te ayudará a diagnosticar problemas de conexión con MongoDB Atlas.');
    console.log('--------------------------------------------------------');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI no está definida en las variables de entorno');
      return;
    }
    
    // Verificar si la URI contiene un placeholder de contraseña
    if (MONGODB_URI.includes('<db_password>')) {
      console.error('Error: La URI de MongoDB contiene un placeholder de contraseña.');
      console.error('Por favor, reemplaza <db_password> en tu archivo .env con tu contraseña real de MongoDB Atlas.');
      return;
    }
    
    // Ocultar la contraseña en los logs
    const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
    console.log('URI de MongoDB (oculta):', maskedURI);
    
    // Extraer el hostname de la URI
    const uriMatch = MONGODB_URI.match(/@([^\/]+)/);
    if (!uriMatch) {
      console.error('Error: No se pudo extraer el hostname de la URI de MongoDB');
      return;
    }
    
    const hostname = uriMatch[1];
    console.log('Hostname de MongoDB Atlas:', hostname);
    
    // Verificar resolución DNS
    console.log('\nVerificando resolución DNS...');
    try {
      const addresses = await resolveDNS(hostname);
      console.log('Resolución DNS exitosa. Direcciones IP:');
      addresses.forEach(addr => console.log(`- ${addr}`));
    } catch (error) {
      console.error('Error en la resolución DNS:', error.message);
      console.error('Esto podría indicar un problema con tu conexión a Internet o con el DNS.');
    }
    
    // Verificar conectividad con los hosts de MongoDB Atlas
    console.log('\nVerificando conectividad con los hosts de MongoDB Atlas...');
    const hosts = [
      'ac-u3e6jve-shard-00-00.bhhr20s.mongodb.net',
      'ac-u3e6jve-shard-00-01.bhhr20s.mongodb.net',
      'ac-u3e6jve-shard-00-02.bhhr20s.mongodb.net'
    ];
    
    const results = await Promise.all(hosts.map(checkHostConnectivity));
    results.forEach(result => {
      console.log(`- ${result.host}: ${result.ok ? 'OK' : 'Error'} (${result.status})`);
    });
    
    // Verificar si todos los hosts son accesibles
    const allHostsAccessible = results.every(result => result.ok);
    if (!allHostsAccessible) {
      console.error('\nNo todos los hosts de MongoDB Atlas son accesibles.');
      console.error('Esto podría indicar un problema con tu conexión a Internet o con un firewall.');
    } else {
      console.log('\nTodos los hosts de MongoDB Atlas son accesibles.');
    }
    
    // Intentar conectar a MongoDB
    console.log('\nIntentando conectar a MongoDB...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      replicaSet: 'atlas-3i59kx-shard-0',
      readPreference: 'primaryPreferred',
      ssl: true,
      tlsAllowInvalidCertificates: true
    };
    
    try {
      await mongoose.connect(MONGODB_URI, options);
      console.log('¡Conexión exitosa a MongoDB!');
      console.log('Estado de la conexión:', mongoose.connection.readyState);
      
      // Cerrar la conexión
      await mongoose.connection.close();
      console.log('Conexión cerrada correctamente');
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error.message);
      
      if (error.name === 'MongooseServerSelectionError') {
        console.error('Detalles del error de selección de servidor:', {
          reason: error.reason,
          code: error.code
        });
        
        // Sugerencias adicionales para resolver el problema
        console.error('\nSugerencias para resolver el problema:');
        console.error('1. Verifica que el clúster de MongoDB Atlas esté activo y funcionando');
        console.error('2. Asegúrate de que la URI de conexión sea correcta');
        console.error('3. Verifica que el nombre de usuario y la contraseña sean correctos');
        console.error('4. Comprueba que el nombre del clúster en la URI coincida con el clúster real');
        console.error('5. Intenta conectarte desde otra red (por ejemplo, usando datos móviles)');
      }
    }
    
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
checkMongoDBConnection(); 
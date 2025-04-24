import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verifyMongoDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('=== Verificación detallada de MongoDB Atlas ===\n');

    // 1. Verificar formato de la URI
    console.log('1. Verificando formato de la URI...');
    const srvPattern = /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?$/;
    const directPattern = /^mongodb:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/;
    
    const srvMatch = MONGODB_URI.match(srvPattern);
    const directMatch = MONGODB_URI.match(directPattern);
    const match = srvMatch || directMatch;

    if (!match) {
      console.error('❌ Formato de URI inválido');
      return;
    }

    const [_, username, password, hosts, database, params] = match;
    console.log('✅ Formato de URI válido');
    console.log(`- Hosts: ${hosts}`);
    console.log(`- Usuario: ${username}`);
    console.log(`- Base de datos: ${database || 'no especificada'}`);
    console.log(`- Tipo de conexión: ${srvMatch ? 'SRV (DNS)' : 'Directa'}`);

    // 2. Intentar conexión con timeout reducido
    console.log('\n2. Intentando conexión rápida...');
    const quickOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    try {
      await mongoose.connect(MONGODB_URI, quickOptions);
      console.log('✅ Conexión rápida exitosa');
      await mongoose.connection.close();
    } catch (error) {
      console.error('❌ Conexión rápida fallida:', error.message);
    }

    // 3. Intentar conexión con timeout extendido
    console.log('\n3. Intentando conexión con timeout extendido...');
    const extendedOptions = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    try {
      await mongoose.connect(MONGODB_URI, extendedOptions);
      console.log('✅ Conexión extendida exitosa');
      
      // Verificar la conexión
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      console.log('\n4. Información del servidor:');
      console.log(`- Versión: ${serverStatus.version}`);
      console.log(`- Conexiones activas: ${serverStatus.connections.current}`);
      console.log(`- Uptime: ${Math.floor(serverStatus.uptime / 3600)} horas`);
      
      await mongoose.connection.close();
    } catch (error) {
      console.error('❌ Conexión extendida fallida:', error.message);
      
      if (error.message.includes('Authentication failed')) {
        console.log('\nProblema detectado: Error de autenticación');
        console.log('Soluciones sugeridas:');
        console.log('1. Verifica que el usuario y contraseña sean correctos');
        console.log('2. Asegúrate de que el usuario tenga permisos en la base de datos');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.log('\nProblema detectado: No se puede resolver el hostname');
        console.log('Soluciones sugeridas:');
        console.log('1. Verifica que los servidores estén correctos');
        console.log('2. Intenta usar la conexión directa si estás usando SRV');
      } else if (error.message.includes('connection timed out')) {
        console.log('\nProblema detectado: Timeout de conexión');
        console.log('Soluciones sugeridas:');
        console.log('1. Verifica tu conexión a internet');
        console.log('2. Comprueba si hay un firewall bloqueando la conexión');
        console.log('3. Verifica que los puertos 27017 estén accesibles');
      }
    }
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  }
}

verifyMongoDB(); 
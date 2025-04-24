import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

// Configurar dotenv
dotenv.config();

const lookup = promisify(dns.lookup);

async function testConnection() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('=== Iniciando prueba de conexión a MongoDB ===');
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI no está definida en las variables de entorno');
      return;
    }

    // Extraer el hostname de la URI
    const hostname = MONGODB_URI.match(/@([^\/]+)/)?.[1];
    if (!hostname) {
      console.error('Error: No se pudo extraer el hostname de la URI');
      return;
    }

    console.log('\n1. Verificando resolución DNS...');
    try {
      const { address } = await lookup(hostname);
      console.log(`✅ Hostname resuelto a IP: ${address}`);
    } catch (error) {
      console.error(`❌ Error al resolver el hostname: ${error.message}`);
      console.log('Sugerencia: Verifica que el clúster de MongoDB Atlas esté activo');
      return;
    }

    console.log('\n2. Intentando conexión a MongoDB...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Conexión exitosa a MongoDB');
    
    // Obtener información del servidor
    const serverInfo = await mongoose.connection.db.admin().serverStatus();
    console.log('\n3. Información del servidor:');
    console.log(`- Versión: ${serverInfo.version}`);
    console.log(`- Host: ${serverInfo.host}`);
    console.log(`- Uptime: ${Math.floor(serverInfo.uptime / 3600)} horas`);

    await mongoose.connection.close();
    console.log('\n✅ Prueba completada exitosamente');
  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    console.error(error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nPosibles causas:');
      console.error('1. El clúster de MongoDB Atlas no está activo');
      console.error('2. La URI de conexión es incorrecta');
      console.error('3. Las credenciales son incorrectas');
      console.error('4. Problemas de red o firewall');
    }
  }
}

testConnection(); 
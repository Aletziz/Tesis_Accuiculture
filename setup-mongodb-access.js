import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const ip = JSON.parse(data).ip;
          resolve(ip);
        } catch (e) {
          reject(new Error('No se pudo obtener la IP pública'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function getLocalIP() {
  try {
    const { stdout } = await execAsync('ipconfig');
    const ipv4Match = stdout.match(/IPv4[^:]*:\s*([^\r\n]+)/);
    return ipv4Match ? ipv4Match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

async function setupMongoDBAccess() {
  console.log('=== Configuración de Acceso a MongoDB Atlas ===\n');

  try {
    // 1. Obtener IPs
    console.log('1. Obteniendo información de red...');
    const [publicIP, localIP] = await Promise.all([getPublicIP(), getLocalIP()]);

    console.log(`- IP Pública: ${publicIP}`);
    if (localIP) console.log(`- IP Local: ${localIP}`);

    // 2. Instrucciones
    console.log('\n2. Pasos para configurar el acceso:');
    console.log('a) Inicia sesión en MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('b) Selecciona tu proyecto y clúster');
    console.log('c) Ve a "Network Access" en el menú lateral');
    console.log('d) Haz clic en "+ ADD IP ADDRESS"');
    console.log('e) Agrega las siguientes IPs:');
    console.log(`   - Tu IP pública: ${publicIP}`);
    if (localIP) console.log(`   - Tu IP local: ${localIP}`);
    console.log('   - O usa 0.0.0.0/0 para permitir acceso desde cualquier IP (no recomendado para producción)');
    
    console.log('\n3. Verificación:');
    console.log('- Después de agregar las IPs, espera 1-2 minutos');
    console.log('- Ejecuta "node verify-mongodb.js" para probar la conexión');
    
    console.log('\nNota: Si sigues teniendo problemas después de agregar las IPs:');
    console.log('1. Verifica que el clúster esté activo');
    console.log('2. Confirma que las credenciales sean correctas');
    console.log('3. Asegúrate de que no haya un firewall bloqueando el puerto 27017');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nPuedes agregar manualmente tu IP en MongoDB Atlas:');
    console.log('1. Ve a https://cloud.mongodb.com');
    console.log('2. Network Access -> Add IP Address');
    console.log('3. Usa 0.0.0.0/0 para permitir todas las IPs temporalmente');
  }
}

setupMongoDBAccess(); 
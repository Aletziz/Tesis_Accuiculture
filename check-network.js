import dns from 'dns';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const lookup = promisify(dns.lookup);

async function checkNetwork() {
  console.log('=== Verificación de Red y DNS ===\n');

  // 1. Verificar conexión a internet
  console.log('1. Verificando conexión a internet...');
  try {
    await execAsync('ping 8.8.8.8 -n 1');
    console.log('✅ Conexión a internet funcionando');
  } catch (error) {
    console.error('❌ Error de conexión a internet');
    return;
  }

  // 2. Verificar DNS de Google
  console.log('\n2. Verificando DNS de Google...');
  try {
    const { address } = await lookup('google.com');
    console.log(`✅ DNS de Google funcionando (${address})`);
  } catch (error) {
    console.error('❌ Error en DNS de Google');
    return;
  }

  // 3. Verificar MongoDB Atlas
  console.log('\n3. Verificando MongoDB Atlas...');
  try {
    const { address } = await lookup('tesis.bhhr20s.mongodb.net');
    console.log(`✅ MongoDB Atlas resuelto a IP: ${address}`);
  } catch (error) {
    console.error('❌ Error al resolver MongoDB Atlas');
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que el clúster de MongoDB Atlas esté activo');
    console.log('2. Intenta usar una red diferente (por ejemplo, datos móviles)');
    console.log('3. Verifica la configuración del firewall');
    console.log('4. Intenta usar un DNS diferente (por ejemplo, 8.8.8.8)');
  }

  // 4. Verificar configuración de DNS
  console.log('\n4. Verificando configuración de DNS...');
  try {
    const { stdout } = await execAsync('ipconfig /all');
    const dnsServers = stdout.match(/DNS Servers[^:]*:\s*([^\n]+)/g);
    if (dnsServers) {
      console.log('Servidores DNS configurados:');
      dnsServers.forEach(server => console.log(`- ${server.split(':')[1].trim()}`));
    }
  } catch (error) {
    console.error('❌ Error al obtener configuración de DNS');
  }
}

checkNetwork(); 
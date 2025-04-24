import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findProcessUsingPort(port) {
  try {
    console.log(`Buscando proceso que está usando el puerto ${port}...`);
    
    // Comando para Windows
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout) {
      console.log(`No se encontró ningún proceso usando el puerto ${port}`);
      return;
    }
    
    console.log('Procesos encontrados:');
    console.log(stdout);
    
    // Extraer el PID del proceso
    const lines = stdout.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const parts = lastLine.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        console.log(`\nPID del proceso: ${pid}`);
        
        // Obtener información del proceso
        try {
          const { stdout: processInfo } = await execAsync(`tasklist | findstr ${pid}`);
          console.log('\nInformación del proceso:');
          console.log(processInfo);
          
          console.log('\nPara terminar este proceso, puedes usar el siguiente comando:');
          console.log(`taskkill /F /PID ${pid}`);
        } catch (error) {
          console.log('No se pudo obtener información del proceso');
        }
      }
    }
  } catch (error) {
    console.error('Error al buscar el proceso:', error.message);
  }
}

// Obtener el puerto de los argumentos de la línea de comandos o usar 8080 por defecto
const port = process.argv[2] || 8080;
findProcessUsingPort(port); 
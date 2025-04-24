import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);

// Crear interfaz de readline para interactuar con el usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function killProcessUsingPort(port) {
  try {
    console.log(`Buscando proceso que está usando el puerto ${port}...`);
    
    // Comando para Windows
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout) {
      console.log(`No se encontró ningún proceso usando el puerto ${port}`);
      rl.close();
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
          
          // Preguntar al usuario si desea terminar el proceso
          rl.question('\n¿Deseas terminar este proceso? (s/n): ', async (answer) => {
            if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
              try {
                await execAsync(`taskkill /F /PID ${pid}`);
                console.log(`Proceso con PID ${pid} terminado exitosamente.`);
              } catch (error) {
                console.error('Error al terminar el proceso:', error.message);
              }
            } else {
              console.log('Operación cancelada.');
            }
            rl.close();
          });
        } catch (error) {
          console.log('No se pudo obtener información del proceso');
          rl.close();
        }
      } else {
        console.log('No se pudo identificar el PID del proceso');
        rl.close();
      }
    } else {
      console.log('No se encontraron procesos usando el puerto especificado');
      rl.close();
    }
  } catch (error) {
    console.error('Error al buscar el proceso:', error.message);
    rl.close();
  }
}

// Obtener el puerto de los argumentos de la línea de comandos o usar 8080 por defecto
const port = process.argv[2] || 8080;
killProcessUsingPort(port); 
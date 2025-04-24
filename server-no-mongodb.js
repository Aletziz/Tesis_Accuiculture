import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import net from 'net';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;

// Middleware para parsear JSON con un límite de 50mb
app.use(express.json({ limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(join(__dirname, '.')));

// Servir archivos CSS específicamente
app.use('/css', express.static(join(__dirname, 'css')));

// Servir archivos JS específicamente
app.use('/js', express.static(join(__dirname, 'js')));

// Función para verificar si un puerto está en uso
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(true);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
};

// Función para encontrar un puerto disponible
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`Puerto ${port} en uso, intentando con el siguiente...`);
    port++;
  }
  return port;
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('=== Iniciando servidor sin MongoDB ===');
    console.log('Este modo te permitirá trabajar sin necesidad de una conexión a MongoDB.');
    console.log('Algunas funcionalidades que dependen de MongoDB no estarán disponibles.');
    console.log('--------------------------------------------------------');

    // Ruta de health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        mongodb: 'disabled',
        timestamp: new Date().toISOString(),
        environment: 'development'
      });
    });

    // Ruta principal
    app.get('/', (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
    });

    // Ruta para listar archivos
    app.get('/api/files', async (req, res) => {
      try {
        const files = await fs.readdir(__dirname);
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        res.json(htmlFiles);
      } catch (error) {
        console.error('Error al listar archivos:', error);
        res.status(500).json({ error: 'Error al listar archivos' });
      }
    });

    // Ruta para obtener el contenido de un archivo
    app.get('/api/files/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const filePath = join(__dirname, filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content });
      } catch (error) {
        console.error('Error al leer archivo:', error);
        res.status(500).json({ error: 'Error al leer archivo' });
      }
    });

    // Ruta para guardar cambios en un archivo
    app.post('/api/files/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const { content } = req.body;
        const filePath = join(__dirname, filename);
        await fs.writeFile(filePath, content, 'utf8');
        res.json({ message: 'Archivo guardado exitosamente' });
      } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ error: 'Error al guardar archivo' });
      }
    });

    // Middleware de manejo de errores
    app.use((err, req, res, next) => {
      console.error('Error en el servidor:', err);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    });

    // Encontrar un puerto disponible
    const port = await findAvailablePort(DEFAULT_PORT);
    
    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      console.log('Modo: development (sin MongoDB)');
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app; 
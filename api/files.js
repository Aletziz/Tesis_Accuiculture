import { promises as fs } from 'fs';

// Manejador para obtener la lista de archivos
export async function getFiles(req, res) {
  try {
    // Leer del sistema de archivos
    const files = await fs.readdir('.');
    res.status(200).json(files);
  } catch (error) {
    console.error('Error al leer directorio:', error);
    res.status(500).json({ error: 'Error al leer directorio' });
  }
}

// Manejador para obtener el contenido de un archivo
export async function getFileContent(req, res) {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Ruta de archivo no proporcionada' });
    }

    // Leer del sistema de archivos
    const content = await fs.readFile(filePath, 'utf8');
    res.status(200).send(content);
  } catch (error) {
    console.error('Error al leer archivo:', error);
    res.status(500).json({ error: 'Error al leer archivo' });
  }
}

// Manejador para guardar cambios en un archivo
export async function saveFile(req, res) {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || !content) {
      return res.status(400).json({ error: 'Ruta de archivo o contenido no proporcionado' });
    }

    // Guardar en el sistema de archivos
    await fs.writeFile(filePath, content, 'utf8');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al guardar archivo:', error);
    res.status(500).json({ error: 'Error al guardar archivo' });
  }
}

// Manejador principal para la ruta /api/files
export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.path) {
          return await getFileContent(req, res);
        } else {
          return await getFiles(req, res);
        }
      case 'POST':
        return await saveFile(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Método ${req.method} no permitido` });
    }
  } catch (error) {
    console.error('Error en la API de archivos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al procesar la solicitud'
    });
  }
} 
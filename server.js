import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
import { Pool } from 'pg';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Render
  }
});

// Middleware para prevenir caché
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Middleware para parsear JSON con un límite de 50mb
app.use(express.json({ limit: "50mb" }));

// Servir archivos estáticos
app.use(express.static(join(__dirname, ".")));

// Servir archivos CSS específicamente
app.use("/css", express.static(join(__dirname, "css")));

// Servir archivos JS específicamente
app.use("/js", express.static(join(__dirname, "js")));

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_contents (
        filename VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
};

// Ruta de health check
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message
    });
  }
});

// Ruta para listar archivos
app.get("/api/files", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT filename FROM file_contents');
    client.release();
    res.json(result.rows.map(row => row.filename));
  } catch (error) {
    console.error("Error al listar archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

// Ruta para obtener el contenido de un archivo
app.get("/api/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      'SELECT content FROM file_contents WHERE filename = $1',
      [filename]
    );
    client.release();

    if (result.rows.length > 0) {
      res.json({ content: result.rows[0].content });
    } else {
      // Si no existe en la base de datos, intentar leer del sistema de archivos
      try {
        const filePath = join(__dirname, filename);
        const content = await fs.readFile(filePath, "utf8");
        // Guardar en la base de datos para futuras referencias
        await saveToDatabase(filename, content);
        res.json({ content });
      } catch (fileError) {
        res.status(404).json({ error: "Archivo no encontrado" });
      }
    }
  } catch (error) {
    console.error("Error al leer archivo:", error);
    res.status(500).json({ error: "Error al leer archivo" });
  }
});

// Función auxiliar para guardar en la base de datos
const saveToDatabase = async (filename, content) => {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO file_contents (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2, last_updated = CURRENT_TIMESTAMP',
      [filename, content]
    );
  } finally {
    client.release();
  }
};

// Ruta para guardar cambios en un archivo
app.post("/api/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    // Guardar en la base de datos
    await saveToDatabase(filename, content);
    console.log(`Archivo ${filename} guardado en la base de datos`);

    res.json({ message: "Archivo guardado exitosamente" });
  } catch (error) {
    console.error("Error al guardar archivo:", error);
    res.status(500).json({ error: "Error al guardar archivo" });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message
  });
});

// Iniciar el servidor
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log("Modo:", process.env.NODE_ENV || "development");
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

export default app;

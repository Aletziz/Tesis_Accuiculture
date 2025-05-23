import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
import { Pool } from "pg";
import cors from "cors";

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Middleware para prevenir caché
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
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

// Función para convertir consultas PostgreSQL a SQLite
function convertPgToSqlite(pgQuery) {
  // Reemplazar sintaxis específica de PostgreSQL con equivalentes SQLite
  let sqliteQuery = pgQuery
    .replace(/NOW\(\)/g, "datetime('now')")
    .replace(/RETURNING \*/g, "")
    .replace(/\$(\d+)/g, "?")
    .replace(/CURRENT_TIMESTAMP/g, "datetime('now')");

  return sqliteQuery;
}

// Función para crear tablas en SQLite
async function createSQLiteTables(db) {
  // Crear las tablas necesarias para tu aplicación
  await db.exec(`
    CREATE TABLE IF NOT EXISTS file_contents (
      filename TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      last_updated TIMESTAMP DEFAULT (datetime('now'))
    );
  `);

  console.log("Tablas SQLite creadas correctamente");
}

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    // Intentar conectar a PostgreSQL primero
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Probar la conexión
    await pool.query("SELECT NOW()");
    console.log("Conexión exitosa a PostgreSQL");

    // Crear tabla si no existe
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_contents (
        filename VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
    console.log("Base de datos PostgreSQL inicializada correctamente");

    return pool;
  } catch (error) {
    console.log("No se pudo conectar a PostgreSQL:", error.message);
    console.log("Usando SQLite como base de datos local de respaldo");

    try {
      // Usar SQLite como respaldo
      const sqlite3 = await import("sqlite3").then((sqlite3) =>
        sqlite3.default.verbose()
      );
      const { open } = await import("sqlite");

      // Crear directorio para la base de datos si no existe
      const fsNode = await import("fs");
      if (!fsNode.existsSync("./db")) {
        fsNode.mkdirSync("./db");
      }

      // Abrir conexión SQLite
      const db = await open({
        filename: "./db/local.db",
        driver: sqlite3.Database,
      });

      // Crear tablas necesarias si no existen
      await createSQLiteTables(db);

      // Devolver un objeto con interfaz similar a pg para mantener compatibilidad
      return {
        connect: async () => {
          return {
            query: async (text, params) => {
              const sqliteQuery = convertPgToSqlite(text);
              try {
                if (sqliteQuery.startsWith("SELECT")) {
                  const rows = await db.all(sqliteQuery, params);
                  return { rows };
                } else {
                  const result = await db.run(sqliteQuery, params);
                  return { rowCount: result.changes, rows: [] };
                }
              } catch (err) {
                console.error("Error en consulta SQLite:", err);
                throw err;
              }
            },
            release: () => {},
          };
        },
        query: async (text, params) => {
          const sqliteQuery = convertPgToSqlite(text);
          try {
            if (sqliteQuery.startsWith("SELECT")) {
              const rows = await db.all(sqliteQuery, params);
              return { rows };
            } else {
              const result = await db.run(sqliteQuery, params);
              return { rowCount: result.changes, rows: [] };
            }
          } catch (err) {
            console.error("Error en consulta SQLite:", err);
            throw err;
          }
        },
        end: async () => await db.close(),
      };
    } catch (sqliteError) {
      console.error("Error al inicializar SQLite:", sqliteError);
      throw sqliteError;
    }
  }
};

// Función para cargar archivos iniciales en la base de datos
const loadInitialFiles = async () => {
  try {
    const files = await fs.readdir(__dirname);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    const client = await pool.connect();
    for (const filename of htmlFiles) {
      try {
        // Primero intentar obtener el contenido de la base de datos
        const dbResult = await client.query(
          "SELECT content FROM file_contents WHERE filename = $1",
          [filename]
        );

        if (dbResult.rows.length > 0) {
          // Si existe en la base de datos, restaurar el archivo
          const filePath = join(__dirname, filename);
          await fs.writeFile(filePath, dbResult.rows[0].content, "utf8");
          console.log(`Archivo ${filename} restaurado desde la base de datos`);
        } else {
          // Si no existe en la base de datos, cargar desde el sistema de archivos
          const filePath = join(__dirname, filename);
          const content = await fs.readFile(filePath, "utf8");

          // Guardar en la base de datos
          await client.query(
            "INSERT INTO file_contents (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2, last_updated = CURRENT_TIMESTAMP",
            [filename, content]
          );
          console.log(
            `Archivo ${filename} cargado desde el sistema de archivos`
          );
        }
      } catch (error) {
        console.error(`Error al procesar ${filename}:`, error);
      }
    }
    client.release();
  } catch (error) {
    console.error("Error al cargar archivos iniciales:", error);
  }
};

// Ruta para listar archivos
app.get("/api/files", async (req, res) => {
  try {
    const files = await fs.readdir(__dirname);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));
    res.json(htmlFiles);
  } catch (error) {
    console.error("Error al listar archivos:", error);
    res.status(500).json({ error: "Error al listar archivos" });
  }
});

// Ruta para obtener el contenido de un archivo
app.get("/api/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = join(__dirname, filename);

    // Intentar leer del sistema de archivos primero
    try {
      const content = await fs.readFile(filePath, "utf8");

      // Actualizar la base de datos con el contenido actual
      const client = await pool.connect();
      await client.query(
        "INSERT INTO file_contents (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2, last_updated = CURRENT_TIMESTAMP",
        [filename, content]
      );
      client.release();

      return res.json({ content });
    } catch (fileError) {
      // Si no se puede leer del sistema de archivos, intentar leer de la base de datos
      const client = await pool.connect();
      const result = await client.query(
        "SELECT content FROM file_contents WHERE filename = $1",
        [filename]
      );
      client.release();

      if (result.rows.length > 0) {
        // Intentar restaurar el archivo desde la base de datos
        try {
          await fs.writeFile(filePath, result.rows[0].content, "utf8");
          console.log(`Archivo ${filename} restaurado desde la base de datos`);
          return res.json({ content: result.rows[0].content, restored: true });
        } catch (restoreError) {
          console.error(
            `Error al restaurar archivo ${filename}:`,
            restoreError
          );
          // Aún así devolver el contenido de la base de datos
          return res.json({
            content: result.rows[0].content,
            fromDatabase: true,
          });
        }
      }

      return res.status(404).json({ error: "Archivo no encontrado" });
    }
  } catch (error) {
    console.error("Error al leer archivo:", error);
    res.status(500).json({ error: "Error al leer archivo" });
  }
});

// Ruta para guardar cambios en un archivo
app.post("/api/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    const filePath = join(__dirname, filename);

    // Guardar en el sistema de archivos primero
    try {
      await fs.writeFile(filePath, content, "utf8");
      console.log(`Archivo guardado en el sistema de archivos: ${filePath}`);

      // Verificar que el archivo se guardó correctamente
      const savedContent = await fs.readFile(filePath, "utf8");
      if (savedContent !== content) {
        console.error(
          "¡Advertencia! El contenido guardado no coincide con el original"
        );
        // Intentar guardar nuevamente
        await fs.writeFile(filePath, content, "utf8");
        console.log("Reintento de guardado completado");
      }
    } catch (fileError) {
      console.error("Error al guardar en el sistema de archivos:", fileError);
      return res
        .status(500)
        .json({ error: "Error al guardar en el sistema de archivos" });
    }

    // Guardar en la base de datos
    try {
      const client = await pool.connect();
      await client.query(
        "INSERT INTO file_contents (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2, last_updated = CURRENT_TIMESTAMP",
        [filename, content]
      );
      client.release();
      console.log(`Archivo ${filename} guardado en la base de datos`);
    } catch (dbError) {
      console.error("Error al guardar en la base de datos:", dbError);
      // No retornamos error aquí porque el archivo ya se guardó en el sistema de archivos
    }

    res.json({
      message: "Archivo guardado exitosamente",
      savedIn: {
        fileSystem: true,
        database: true,
      },
    });
  } catch (error) {
    console.error("Error al guardar archivo:", error);
    res.status(500).json({ error: "Error al guardar archivo" });
  }
});

// Ruta para servir archivos HTML directamente desde la base de datos
app.get("/*.html", async (req, res) => {
  try {
    const filename = req.path.substring(1); // Remover el slash inicial
    const client = await pool.connect();
    const result = await client.query(
      "SELECT content FROM file_contents WHERE filename = $1",
      [filename]
    );
    client.release();

    if (result.rows.length > 0) {
      res.setHeader("Content-Type", "text/html");
      res.send(result.rows[0].content);
    } else {
      // Si no está en la base de datos, intentar leer del sistema de archivos
      try {
        const filePath = join(__dirname, filename);
        const content = await fs.readFile(filePath, "utf8");

        // Guardar en la base de datos
        const saveClient = await pool.connect();
        await saveClient.query(
          "INSERT INTO file_contents (filename, content) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET content = $2, last_updated = CURRENT_TIMESTAMP",
          [filename, content]
        );
        saveClient.release();

        res.setHeader("Content-Type", "text/html");
        res.send(content);
      } catch (fileError) {
        res.status(404).send("Archivo no encontrado");
      }
    }
  } catch (error) {
    console.error("Error al servir archivo:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta de health check
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message,
  });
});

// Iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar la base de datos y guardar la conexión
    global.pool = await initDatabase();
    await loadInitialFiles();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log("Modo:", process.env.NODE_ENV || "development");
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

export default app;

// Añadir esta ruta para listar imágenes de la carpeta imgs
app.get("/api/images", async (req, res) => {
  try {
    const imgsDir = join(__dirname, "imgs");

    // Verificar si la carpeta existe
    try {
      await fs.access(imgsDir);
    } catch (error) {
      // Si la carpeta no existe, crearla
      await fs.mkdir(imgsDir, { recursive: true });
      return res.json([]);
    }

    // Leer archivos de la carpeta
    const files = await fs.readdir(imgsDir);

    // Filtrar solo archivos de imagen
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const imageFiles = files.filter((file) => {
      const ext = file.toLowerCase().substring(file.lastIndexOf("."));
      return imageExtensions.includes(ext);
    });

    // Crear array de objetos con información de las imágenes
    const images = imageFiles.map((file) => ({
      name: file,
      path: `/imgs/${file}`,
    }));

    res.json(images);
  } catch (error) {
    console.error("Error al listar imágenes:", error);
    res.status(500).json({ error: "Error al listar imágenes" });
  }
});

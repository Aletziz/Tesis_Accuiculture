import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import connectDB from "./db.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON con un límite de 50mb
app.use(express.json({ limit: "50mb" }));

// Servir archivos estáticos
app.use(express.static(join(__dirname, ".")));

// Servir archivos CSS específicamente
app.use("/css", express.static(join(__dirname, "css")));

// Servir archivos JS específicamente
app.use("/js", express.static(join(__dirname, "js")));

// Variable para almacenar el estado de la conexión a MongoDB
let isMongoDBConnected = false;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Intentar conectar a MongoDB
    isMongoDBConnected = await connectDB();

    if (isMongoDBConnected) {
      console.log("Conexión a MongoDB establecida");
    } else {
      console.warn(
        "No se pudo conectar a MongoDB. El servidor continuará, pero los datos solo se guardarán localmente."
      );
    }

    // Ruta de health check
    app.get("/api/health", (req, res) => {
      res.json({
        status: "ok",
        mongodb: isMongoDBConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Ruta principal
    app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "index.html"));
    });

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

    // Ruta para obtener el contenido de un archivo (eliminar esta primera definición)
    app.get("/api/files/:filename", async (req, res) => {
      try {
        const { filename } = req.params;
        const filePath = join(__dirname, filename);

        // Intentar obtener de MongoDB primero si está conectado
        if (isMongoDBConnected) {
          try {
            // Si el modelo no existe, crearlo
            let FileContent;
            try {
              FileContent = mongoose.model("FileContent");
            } catch (modelError) {
              const fileContentSchema = new mongoose.Schema({
                filename: { type: String, required: true, unique: true },
                content: { type: String, required: true },
                lastUpdated: { type: Date, default: Date.now },
              });

              FileContent = mongoose.model("FileContent", fileContentSchema);
            }

            // Buscar en MongoDB
            const fileDoc = await FileContent.findOne({ filename });

            if (fileDoc) {
              console.log(`Contenido de ${filename} recuperado de MongoDB`);
              return res.json({ content: fileDoc.content });
            }
          } catch (dbError) {
            console.error("Error al recuperar de MongoDB:", dbError);
            // Continuar para intentar leer del sistema de archivos
          }
        }

        // Si no se encontró en MongoDB o hubo un error, leer del sistema de archivos
        const content = await fs.readFile(filePath, "utf8");
        res.json({ content });
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

        // En la ruta para guardar cambios, después de guardar en el sistema de archivos:
        // Guardar en el sistema de archivos
        await fs.writeFile(filePath, content, "utf8");
        console.log(`Archivo guardado en el sistema de archivos: ${filePath}`);

        // Verificar que el archivo se guardó correctamente
        try {
          const savedContent = await fs.readFile(filePath, "utf8");
          if (savedContent !== content) {
            console.error(
              "¡Advertencia! El contenido guardado no coincide con el original"
            );
            // Intentar guardar nuevamente
            await fs.writeFile(filePath, content, "utf8");
            console.log("Reintento de guardado completado");
          }
        } catch (verifyError) {
          console.error("Error al verificar el archivo guardado:", verifyError);
        }

        // Crear directorio de respaldos
        const backupDir = join(__dirname, "backups");
        try {
          await fs.mkdir(backupDir, { recursive: true });

          // Guardar una copia de respaldo con timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const backupPath = join(backupDir, `${filename}.${timestamp}.bak`);
          await fs.writeFile(backupPath, content, "utf8");
          console.log(`Respaldo guardado en: ${backupPath}`);

          // Guardar la última versión conocida
          const latestBackupPath = join(backupDir, `${filename}.latest.bak`);
          await fs.writeFile(latestBackupPath, content, "utf8");
        } catch (backupError) {
          console.error("Error al crear respaldo:", backupError);
        }

        // Verificar si MongoDB está conectado
        if (mongoose.connection.readyState === 1) {
          try {
            // Si el modelo no existe, crearlo
            let FileContent;
            try {
              FileContent = mongoose.model("FileContent");
            } catch (modelError) {
              const fileContentSchema = new mongoose.Schema({
                filename: { type: String, required: true, unique: true },
                content: { type: String, required: true },
                lastUpdated: { type: Date, default: Date.now },
              });

              FileContent = mongoose.model("FileContent", fileContentSchema);
            }

            // Guardar o actualizar en MongoDB
            await FileContent.findOneAndUpdate(
              { filename },
              { filename, content, lastUpdated: new Date() },
              { upsert: true, new: true }
            );
            console.log(`Contenido de ${filename} guardado en MongoDB`);
          } catch (dbError) {
            console.error("Error al guardar en MongoDB:", dbError);
          }
        } else {
          console.warn(
            "MongoDB no está conectado. Los datos solo se guardarán localmente."
          );
        }

        res.json({ message: "Archivo guardado exitosamente" });
      } catch (error) {
        console.error("Error al guardar archivo:", error);
        res.status(500).json({ error: "Error al guardar archivo" });
      }
    });

    // Ruta para obtener el contenido de un archivo
    app.get("/api/files/:filename", async (req, res) => {
      try {
        const { filename } = req.params;
        const filePath = join(__dirname, filename);

        // Intentar obtener de MongoDB primero si está conectado
        if (mongoose.connection.readyState === 1) {
          try {
            // Si el modelo no existe, crearlo
            let FileContent;
            try {
              FileContent = mongoose.model("FileContent");
            } catch (modelError) {
              const fileContentSchema = new mongoose.Schema({
                filename: { type: String, required: true, unique: true },
                content: { type: String, required: true },
                lastUpdated: { type: Date, default: Date.now },
              });

              FileContent = mongoose.model("FileContent", fileContentSchema);
            }

            // Buscar en MongoDB
            const fileDoc = await FileContent.findOne({ filename });

            if (fileDoc) {
              console.log(`Contenido de ${filename} recuperado de MongoDB`);
              return res.json({ content: fileDoc.content });
            }
          } catch (dbError) {
            console.error("Error al recuperar de MongoDB:", dbError);
          }
        }

        // Si no se encontró en MongoDB o hubo un error, intentar leer del sistema de archivos
        try {
          const content = await fs.readFile(filePath, "utf8");
          return res.json({ content });
        } catch (fileError) {
          console.error("Error al leer archivo original:", fileError);

          // Si no se puede leer el archivo original, intentar leer el último respaldo
          try {
            const latestBackupPath = join(
              __dirname,
              "backups",
              `${filename}.latest.bak`
            );
            const backupContent = await fs.readFile(latestBackupPath, "utf8");
            console.log(
              `Recuperando contenido desde respaldo: ${latestBackupPath}`
            );
            return res.json({ content: backupContent, fromBackup: true });
          } catch (backupError) {
            console.error("Error al leer respaldo:", backupError);
            throw fileError; // Lanzar el error original si tampoco se puede leer el respaldo
          }
        }
      } catch (error) {
        console.error("Error al leer archivo:", error);
        res.status(500).json({ error: "Error al leer archivo" });
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
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(
        "Estado de MongoDB:",
        isMongoDBConnected ? "Conectado" : "Desconectado"
      );
      console.log("Modo:", process.env.NODE_ENV || "development");
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

export default app;

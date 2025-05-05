import mongoose from "mongoose";
import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para registrar actividad en un archivo de log
const logActivity = async (message) => {
  try {
    const logDir = join(__dirname, "logs");
    await fs.mkdir(logDir, { recursive: true });

    const logFile = join(logDir, "db-activity.log");
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    await fs.appendFile(logFile, logEntry);
  } catch (error) {
    console.error("Error al escribir en el log:", error.message);
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("La variable de entorno MONGODB_URI no está definida");
      await logActivity("Error: MONGODB_URI no definida");
      return false;
    }

    console.log("Intentando conectar a MongoDB...");
    await logActivity("Intentando conectar a MongoDB");

    // Intentar conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB conectado correctamente");
    await logActivity("MongoDB conectado correctamente");
    return true;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    await logActivity(`Error al conectar a MongoDB: ${error.message}`);

    // Si hay problemas con MongoDB Atlas, sugerir usar MongoDB local
    console.log(
      "\nSi continúas teniendo problemas con MongoDB Atlas, puedes usar MongoDB localmente:"
    );
    console.log("1. Instala MongoDB Community Edition");
    console.log(
      "2. Cambia MONGODB_URI en .env a: mongodb://localhost:27017/tesis_acuicultura\n"
    );

    return false;
  }
};

// Agregar un evento para reconexión en caso de desconexión
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB desconectado. Intentando reconectar...");
  logActivity("MongoDB desconectado. Intentando reconectar...").catch(
    console.error
  );

  setTimeout(() => {
    connectDB().catch((err) => {
      console.error("Error en intento de reconexión:", err.message);
      logActivity(`Error en intento de reconexión: ${err.message}`).catch(
        console.error
      );
    });
  }, 5000); // Intentar reconectar después de 5 segundos
});

export default connectDB;

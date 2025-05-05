import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("La variable de entorno MONGODB_URI no está definida");
      return false;
    }

    console.log(
      "Intentando conectar a MongoDB con URI:",
      process.env.MONGODB_URI.replace(/\/\/(.+?):(.+?)@/, "//***:***@")
    ); // Oculta credenciales en logs

    // Intentar conectar a MongoDB con un timeout más largo
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Aumentar el timeout a 15 segundos
      connectTimeoutMS: 15000,
    });

    console.log("MongoDB conectado correctamente");
    return true;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    console.error("Error completo:", error);

    // Verificar si hay problemas con la contraseña
    if (error.message.includes("Authentication failed")) {
      console.error("\n=== PROBLEMA DE AUTENTICACIÓN ===");
      console.error("El nombre de usuario o la contraseña son incorrectos.");
      console.error("Verifica tus credenciales en el archivo .env");
      console.error("=== FIN DE INSTRUCCIONES ===\n");
    }

    return false;
  }
};

// Agregar un evento para reconexión en caso de desconexión
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB desconectado. Intentando reconectar...");
  setTimeout(() => {
    connectDB().catch((err) => {
      console.error("Error en intento de reconexión:", err.message);
    });
  }, 5000); // Intentar reconectar después de 5 segundos
});

export default connectDB;

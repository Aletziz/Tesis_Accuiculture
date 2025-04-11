import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB conectado');
    } else {
      console.log('MONGODB_URI no definida, omitiendo conexión a MongoDB');
    }
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
  }
};

export { connectDB }; 
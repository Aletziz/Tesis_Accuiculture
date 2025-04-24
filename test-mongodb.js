import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

async function testConnection() {
  try {
    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Conexión exitosa!');
    console.log('Base de datos:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Puerto:', mongoose.connection.port);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\nSugerencias:');
      console.log('1. Verifica que el clúster esté activo en MongoDB Atlas');
      console.log('2. Confirma que el nombre del clúster sea correcto');
      console.log('3. Verifica que las credenciales sean correctas');
      console.log('4. Asegúrate de que 0.0.0.0/0 esté en la lista blanca');
    }
  }
}

testConnection(); 
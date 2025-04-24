import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    console.log('=== Prueba Simple de MongoDB ===\n');
    
    // 1. Mostrar la URI (ocultando la contraseña)
    const uri = process.env.MONGODB_URI;
    console.log('URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));
    
    // 2. Intentar conexión
    console.log('\nIntentando conectar...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    // 3. Si la conexión es exitosa, mostrar información
    console.log('\n✅ Conexión exitosa!');
    console.log('Base de datos:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    // 4. Cerrar la conexión
    await mongoose.connection.close();
    console.log('\nConexión cerrada correctamente');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Mostrar sugerencias basadas en el error
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\nPosibles soluciones:');
      console.log('1. Verifica que el clúster esté activo en MongoDB Atlas');
      console.log('2. Confirma que el nombre del clúster sea correcto');
      console.log('3. Verifica que las credenciales sean correctas');
      console.log('4. Asegúrate de que 0.0.0.0/0 esté en la lista blanca');
      console.log('5. Intenta usar una red diferente');
    }
  }
}

test(); 
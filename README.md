# Tesis Editor

Sistema de edición de texto para tesis de acuicultura.

## Configuración para Vercel

### Requisitos previos

1. Tener una cuenta en [Vercel](https://vercel.com)
2. Tener una base de datos MongoDB (recomendado [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Pasos para el despliegue

1. **Configurar variables de entorno en Vercel**

   - Ve a la configuración de tu proyecto en Vercel
   - En la sección "Environment Variables", agrega las siguientes variables:
     - `MONGODB_URI`: URL de conexión a tu base de datos MongoDB
     - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de tu proyecto Supabase
     - `JWT_SECRET`: Clave secreta para JWT
     - `NODE_ENV`: Establece como "production"

2. **Desplegar la aplicación**

   - Conecta tu repositorio de GitHub a Vercel
   - Selecciona el repositorio y la rama a desplegar
   - Configura el proyecto con las siguientes opciones:
     - Framework Preset: Other
     - Build Command: `npm run vercel-build`
     - Output Directory: `.`
     - Install Command: `npm install`

3. **Verificar el despliegue**

   - Después del despliegue, visita las siguientes rutas para verificar el estado:
     - `/api/hello`: Debería mostrar un mensaje simple
     - `/api/health`: Debería mostrar el estado del servidor
     - `/api/mongodb`: Debería mostrar el estado de la conexión a MongoDB

### Solución de problemas

Si encuentras errores durante el despliegue:

1. **Error de conexión a MongoDB**
   - Verifica que la URI de MongoDB sea correcta
   - Asegúrate de que tu base de datos MongoDB permita conexiones desde Vercel
   - Si usas MongoDB Atlas, agrega la IP de Vercel a la lista blanca

2. **Error de función serverless**
   - Verifica los logs de Vercel para identificar el error específico
   - Asegúrate de que todas las dependencias estén correctamente instaladas
   - Verifica que la estructura de archivos sea compatible con Vercel

3. **Error de archivos estáticos**
   - Verifica que las rutas en vercel.json sean correctas
   - Asegúrate de que los archivos estáticos estén en las ubicaciones correctas

## Desarrollo local

Para ejecutar la aplicación localmente:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo local
npm run local
```

## Estructura del proyecto

- `api/`: Funciones serverless para Vercel
- `css/`: Archivos CSS
- `js/`: Archivos JavaScript
- `models/`: Modelos de datos para MongoDB
- `server.js`: Servidor Express para desarrollo local
- `vercel.json`: Configuración para Vercel

## Características

- Edición de archivos HTML
- Almacenamiento en MongoDB (opcional)
- Autenticación con Supabase
- Interfaz de administración

## Requisitos

- Node.js >= 14.0.0
- MongoDB (opcional)
- Cuenta en Supabase

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd tesis-editor
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` con las siguientes variables:
```
NEXT_PUBLIC_SUPABASE_URL=<tu-url-de-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave-anonima-de-supabase>
MONGODB_URI=<tu-url-de-mongodb>
JWT_SECRET=<una-clave-secreta-aleatoria>
PORT=8080
NODE_ENV=development
```

4. Inicia el servidor:
```bash
npm run local
```

## Estructura del proyecto

- `server.js`: Servidor Express
- `db.js`: Conexión a MongoDB
- `models/`: Modelos de MongoDB
- `css/`: Archivos CSS
- `js/`: Archivos JavaScript
- `*.html`: Archivos HTML

## Solución de problemas

### MongoDB no se conecta

- Verifica que MongoDB esté instalado y ejecutándose localmente
- Si estás usando MongoDB Atlas, verifica que la IP esté en la lista blanca
- Verifica que la URL de conexión sea correcta

### Supabase no funciona

- Verifica que las credenciales de Supabase sean correctas
- Verifica que las políticas de seguridad permitan acceso desde tu dominio

### Problemas con Vercel

- Verifica los logs de Vercel: `vercel logs`
- Verifica que las variables de entorno estén configuradas correctamente
- Verifica que el archivo `vercel.json` esté configurado correctamente

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. 
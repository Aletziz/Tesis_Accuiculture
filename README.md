# Tesis Editor

Sistema de edición de texto para tesis con soporte para MongoDB y Supabase.

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

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si no tienes una.

2. Instala el CLI de Vercel:
```bash
npm install -g vercel
```

3. Inicia sesión en Vercel:
```bash
vercel login
```

4. Configura las variables de entorno en Vercel:
```bash
vercel env add MONGODB_URI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

5. Despliega el proyecto:
```bash
vercel --prod
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
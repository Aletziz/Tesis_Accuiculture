# Sistema de Edición de Texto para Tesis

Este proyecto es un sistema web para editar el contenido de una tesis académica. Permite editar el texto de cada capítulo y sección de manera sencilla y eficiente.

## Características

- Edición de texto en tiempo real
- Formato de texto (negrita, cursiva, subrayado)
- Alineación de texto (izquierda, centro, derecha)
- Listas ordenadas y no ordenadas
- Guardado automático de cambios
- Interfaz intuitiva y fácil de usar

## Tecnologías utilizadas

- HTML, CSS, JavaScript
- Node.js y Express
- MongoDB para almacenamiento de cambios
- Vercel para despliegue

## Instalación local

1. Clona este repositorio
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` con las siguientes variables:
   ```
   MONGODB_URI=tu_uri_de_mongodb
   PORT=3000
   ```
4. Inicia el servidor: `npm start`
5. Accede a http://localhost:3000/admin.html

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com/)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en Vercel:
   - `MONGODB_URI`: URI de conexión a MongoDB
4. Despliega el proyecto

## Uso

1. Accede al panel de administración
2. Inicia sesión con las credenciales:
   - Usuario: admin
   - Contraseña: tesis2024
3. Selecciona el archivo que deseas editar
4. Realiza los cambios necesarios
5. Guarda los cambios

## Estructura del proyecto

- `index.html`: Página principal
- `admin.html`: Panel de administración
- `admin.js`: Funcionalidad del panel de administración
- `server.js`: Servidor Express
- `db.js`: Configuración de MongoDB
- `models/File.js`: Modelo para almacenar cambios en archivos
- `vercel.json`: Configuración para Vercel 
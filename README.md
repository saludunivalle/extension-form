# Extension Form

Aplicación de formularios con autenticación de Google para la Universidad del Valle.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd extension-form
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID= google-client-id
```

### Ejecutar en Desarrollo

1. **Iniciar el servidor backend**
```bash
cd ../extension-server
npm install
npm run dev
```

2. **Iniciar el frontend**
```bash
# En otra terminal, desde extension-form
npm run dev
```

3. **Abrir en el navegador**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🔧 Configuración

### Variables de Entorno

- `VITE_API_URL`: URL del servidor backend
- `VITE_GOOGLE_CLIENT_ID`: ID de cliente de Google OAuth

### Puertos por Defecto

- Frontend: 5173 (Vite)
- Backend: 3001 (Express)

## 🛠️ Scripts Disponibles

### Frontend (extension-form)
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de la build
```

### Backend (extension-server)
```bash
npm run dev          # Iniciar con nodemon (desarrollo)
npm run dev:debug    # Iniciar con debugger
npm start            # Iniciar en producción
```

## 🔍 Solución de Problemas

### Error de Conexión al Backend
- Verificar que el servidor esté corriendo en el puerto 3001
- Verificar la configuración CORS en el servidor
- Revisar las variables de entorno

### Error de Autenticación de Google
- Verificar que el Google Client ID sea correcto
- Verificar que el dominio esté autorizado en Google Console

### Lentitud en el Login
- Verificar la conexión a internet
- Revisar la configuración de timeout en el cliente
- Verificar que el servidor esté respondiendo correctamente

## 📁 Estructura del Proyecto

```
extension-form/
├── src/
│   ├── components/     # Componentes React
│   ├── services/       # Servicios de API
│   ├── config.js       # Configuración centralizada
│   └── ...
├── public/             # Archivos estáticos
└── package.json

extension-server/
├── controllers/        # Controladores de la API
├── routes/            # Rutas de Express
├── services/          # Servicios del backend
├── middleware/        # Middleware personalizado
└── index.js          # Punto de entrada
```

## 🚀 Despliegue

### Frontend (Vercel)
```bash
npm run build
# Subir la carpeta dist a Vercel
```

### Backend (Vercel)
```bash
# Configurar vercel.json y package.json
# Desplegar directamente desde GitHub
```

## 📝 Notas de Desarrollo

- El frontend usa Vite para desarrollo rápido
- El backend usa Express con CORS configurado
- La autenticación es con Google OAuth
- Los datos se almacenan en Google Sheets
- El proyecto está optimizado para desarrollo local y producción

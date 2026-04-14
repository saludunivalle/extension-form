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
## 📌 Cambios Recientes

### Formulario 1

- Se agregaron en el último paso (después de organización/otro):
  - `extension_solidaria`
  - `costo_extension_solidaria` (visible cuando `extension_solidaria = si`)
  - `pieza_grafica` (subida de imagen)
  - `personal_externo`
- Se agregó la lógica de tipo de valor antes de `valor_inscripcion`:
  - `tipo_valor` con dos opciones (`valor_unitario` o `cifra_pesos`)
  - `valor_unitario` (SMMLV)
  - cálculo bidireccional con `valor_inscripcion` usando SMMLV vigente: `1,750,905`

### Formulario 2

- Se ajustó la edición/cálculo de:
  - `imprevistos_porcentaje`
  - `fondo_comun_porcentaje`
  - `facultad_instituto_porcentaje`
- Se agregó `archivo_fondo_comun` (imagen/pdf) cuando `fondo_comun_porcentaje > 30`.
- Se habilitaron/corrigieron filas dinámicas de gastos en SOLICITUDES2 como extras de la categoría 14.

### Carga de datos (rehidratación)

- Se añadieron normalizaciones para mostrar correctamente datos guardados en Sheet/backend aunque vengan en formato distinto:
  - `periodicidad_oferta`
  - `organizacion_actividad`
  - `extension_solidaria`
  - compatibilidad con typo histórico `imprevistos_procentaje`.

### Reportes XLSX

- Los campos nuevos del front se excluyen explícitamente de reportes (no se imprimen en archivos de reporte):
  - `tipo_valor`
  - `valor_unitario`
  - `extension_solidaria`
  - `costo_extension_solidaria`
  - `pieza_grafica`
  - `personal_externo`
  - `archivo_fondo_comun`

## 🧩 Nota de Backend / Google Sheets

- Para `pieza_grafica` y `archivo_fondo_comun`, el frontend envía `multipart/form-data` cuando hay archivo nuevo.
- El backend debe:
  - recibir ambos campos de archivo,
  - subirlos a Drive,
  - guardar la URL resultante en la hoja correspondiente.
- En Sheets, se recomienda tener columnas para:
  - `pieza_grafica`
  - `archivo_fondo_comun`
  - `tipo_valor`
  - `valor_unitario`
  - `extension_solidaria`
  - `costo_extension_solidaria`
  - `personal_externo`




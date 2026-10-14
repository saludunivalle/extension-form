
# Extension Form

## ¿Qué es este sistema?

**Extension Form** es una aplicación web desarrollada para la Universidad del Valle que permite la gestión, diligenciamiento y seguimiento de formularios relacionados con actividades de extensión universitaria. El sistema facilita la recolección de información, la autenticación segura mediante Google, y la integración con Google Sheets para el almacenamiento y procesamiento de datos.

### ¿Para qué sirve?

- Digitaliza y centraliza el proceso de inscripción y reporte de actividades de extensión.
- Permite a los usuarios autenticarse con su cuenta institucional de Google para mayor seguridad y trazabilidad.
- Automatiza el almacenamiento de datos en Google Sheets, facilitando la gestión y análisis posterior.
- Incluye validaciones, cálculos automáticos y lógica de negocio específica para los procesos de extensión.
- Permite la carga de archivos (imágenes, PDFs) asociados a los formularios.
- Genera reportes y exportaciones en formatos como XLSX, excluyendo campos sensibles o internos.
- Optimiza el flujo de trabajo tanto para usuarios como para administradores, reduciendo errores y tiempos de procesamiento.


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

## ⏱️ Recomendaciones para Cuota de Google Sheets

- Implementar reintentos con backoff exponencial en backend cuando la API responda 429 (Too many requests).
- Centralizar guardado por lote (batch) de cambios para reducir llamadas individuales por campo.
- Evitar lecturas repetidas de progreso en el mismo paso usando caché de corta duración (por ejemplo 30-60 segundos).
- Agregar un mecanismo de cola en backend para serializar escrituras y suavizar picos de tráfico.
- Medir y registrar métricas de llamadas por endpoint para identificar qué rutas consumen más cuota.
- Priorizar lecturas desde estado local cuando no haya cambios recientes y refrescar en segundo plano.

## Flujo funcional: administración, riesgos y aprobación

### ¿Existe una vista de administración?

Sí. La vista administrativa se activa cuando el usuario tiene el rol `admin` (obtenido desde la sesión/API). En el panel, el administrador puede:

- Consultar sus propias solicitudes.
- Consultar las solicitudes de otros usuarios que están **Enviado a revisión** o que fueron devueltas con correcciones.
- Abrir los formularios recibidos y revisar la información por pasos.
- Aprobar un formulario individual o aprobar la solicitud completa.
- Devolver uno o varios formularios con correcciones y comentarios por formulario/paso.

Los usuarios que no tienen rol administrativo solo gestionan sus propias solicitudes. Un formulario enviado a revisión o aprobado queda bloqueado para edición por el propietario, mientras que el administrador conserva el acceso de revisión.

### ¿Cuándo se requiere la matriz de riesgos?

En el envío de formularios a revisión:

- Los formularios 1 (**Aprobación**) y 2 (**Presupuesto**) son obligatorios.
- Si el campo `total_horas` es mayor o igual a **16**, el formulario 3 (**Matriz de riesgos**) también es obligatorio.
- Si `total_horas` es menor que 16, el código no obliga a seleccionar el formulario 3 para enviar a revisión.

La validación se realiza con el valor numérico de `total_horas`, recuperándolo desde la solicitud o consultándolo nuevamente en el backend cuando no está disponible en el panel.

### Reapertura de un formulario terminado e impresión

El comportamiento implementado para un formulario terminado es:

- Se puede volver a abrir y navegar por sus pasos ya completados.
- El botón de reporte/impresión se habilita cuando el formulario está marcado como `Completado` (o cuando se terminó el último paso y el backend registró el progreso).
- El reporte se genera como archivo XLSX mediante el servicio de reportes; no depende de imprimir directamente la pantalla del navegador.

Por lo tanto, un formulario terminado no debería volver a solicitar todos los campos ni impedir la generación del reporte. Si ocurre, debe revisarse que la respuesta de la API incluya correctamente `estado_formularios`, `etapa_actual`, `paso` y los datos persistidos de la solicitud; esos valores controlan la rehidratación, el acceso a pasos y la habilitación del reporte.

### Flujo de aprobación

1. El usuario diligencia los formularios y completa sus pasos.
2. Desde el panel selecciona los formularios terminados y los envía a revisión. El sistema valida los formularios obligatorios y la regla de `total_horas >= 16`.
3. Cada formulario enviado cambia a **Enviado a revisión** y queda bloqueado para el propietario.
4. El administrador revisa la solicitud desde la vista administrativa.
5. El administrador puede aprobar formularios individualmente, aprobar la solicitud completa o devolver formularios con correcciones y comentarios.
6. Cuando se solicitan correcciones, el usuario puede editar nuevamente los formularios devueltos y volver a enviarlos a revisión.
7. Un formulario aprobado queda en estado **Aprobado** y permite descargar su reporte. La solicitud completa queda aprobada cuando el administrador ejecuta la aprobación total.




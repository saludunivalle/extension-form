
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

## 14. Nuevo flujo de aprobaciÃ³n

El flujo se maneja por roles y colas. Una solicitud no se asigna inicialmente a un revisor especÃ­fico; queda disponible para el rol responsable.

Roles en `USUARIOS!D:D`:

```text
solicitante, revisor_1, revisor_2, presupuesto, director, decanato, admin
```

Un usuario cuyo campo `role` esté vacío o no tenga un rol especial se considera automáticamente `solicitante`. No es necesario guardar literalmente `solicitante` en `USUARIOS`; el backend lo aplica como rol predeterminado.

Etapas:

```text
solicitud → revision_1 → revision_2 → presupuesto → firmas → decanato → finalizado
```

Todas las rutas nuevas requieren:

```http
Authorization: Bearer <google_id_token>
Content-Type: application/json
```

Las rutas de firma y resolución usan `multipart/form-data`.

### 14.1 Consultar la cola del rol

```http
GET /workflow/cola
```

Para `revisor_1` y `revisor_2`, esta misma ruta también incluye las solicitudes
que ya llegaron a `decanato` y todavía están en `pendiente`, `en_revision` o
`devuelta`. Aunque esas filas conservan `rol_responsable: decanato`, aparecen en
la bandeja del revisor porque ambos roles están autorizados para registrar el
cierre final desde Decanato.

Respuesta:

```json
{
  "success": true,
  "role": "revisor_1",
  "data": [
    {
      "id_solicitud": "123",
      "nombre_actividad": "Curso de primeros auxilios",
      "etapa_codigo": "revision_1",
      "rol_responsable": "revisor_1",
      "usuario_asignado": "",
      "estado_etapa": "pendiente",
      "estado_general": "Enviado a revisiÃ³n"
    }
  ]
}
```

### 14.2 Tomar una solicitud

```http
POST /workflow/:idSolicitud/tomar
```

No requiere body. Esta operación es opcional. Si se utiliza, cambia
`usuario_asignado` al usuario autenticado y `estado_etapa` a `en_revision`.
También registra la acción en `HISTORIAL_ETAPAS`.

Si otro usuario ya la tomó, devuelve `409`.

Un `revisor_1` o `revisor_2` también puede tomar una solicitud cuya etapa sea
`decanato`. Después de tomarla, puede ejecutar
`POST /workflow/cortes-decanato`. La validación de usuario asignado se mantiene:
si otro usuario ya la tomó, el cierre responde `403`.

#### Flujo recomendado cuando hay un único usuario por rol

Cuando existe un único usuario para `revisor_1` y un único usuario para
`revisor_2`, el frontend no necesita llamar a `/tomar`. Puede consultar la cola y
ejecutar directamente la decisión:

```text
GET  /workflow/cola
POST /workflow/:idSolicitud/decision
```

Para una solicitud en Decanato que el revisor pueda cerrar:

```text
GET  /workflow/cola
POST /workflow/:idSolicitud/tomar       (opcional)
POST /workflow/cortes-decanato
```

En este segundo caso, `/tomar` también puede omitirse si
`usuario_asignado` está vacío:

```text
GET  /workflow/cola
POST /workflow/cortes-decanato
```

#### Reglas de asignación

- Si `usuario_asignado` está vacío, el usuario cuyo rol corresponde a la etapa
  puede aprobar o devolver directamente.
- Si `usuario_asignado` contiene el ID del usuario autenticado, ese usuario puede
  continuar trabajando la solicitud.
- Si `usuario_asignado` contiene el ID de otro usuario, las decisiones responden
  `403` y la toma responde `409`.
- Una decisión exitosa limpia `usuario_asignado` al avanzar o devolver la etapa.
- El frontend puede usar `/tomar` si necesita mostrar quién está trabajando una
  solicitud o si posteriormente se incorporan más usuarios por rol.

### 14.3 Aprobar, devolver o cerrar una etapa

```http
POST /workflow/:idSolicitud/decision
```

Body para aprobar:

```json
{
  "accion": "aprobar",
  "comentario": "",
  "comentarios_por_formulario": {}
}
```

Body para devolver:

```json
{
  "accion": "devolver",
  "comentario": "Falta completar la informaciÃ³n financiera.",
  "comentarios_por_formulario": {
    "2": "Revisar los valores del presupuesto"
  }
}
```

El comentario es obligatorio al devolver. El cierre no se realiza desde esta ruta:
cuando la solicitud llegue a `decanato`, el revisor 1 o 2 puede registrar la
resolución final usando `POST /workflow/cortes-decanato`.
Respuesta:

```json
{
  "success": true,
  "data": {
    "id_solicitud": "123",
    "etapa_codigo": "revision_2",
    "estado_etapa": "pendiente"
  }
}
```

La operaciÃ³n se registra en `REVISIONES` y `HISTORIAL_ETAPAS`.

Las observaciones independientes se guardan como JSON en `ETAPAS.K`, la columna
`comentarios`, porque pertenecen a una solicitud y a la etapa en la que fueron
creadas. Se pueden recibir observaciones en cualquier etapa activa del flujo:
`solicitud`, `revision_1`, `revision_2`, `presupuesto`, `firmas` y `decanato`.
Cada observación se agrega como un elemento independiente dentro del arreglo de su
etapa; no se reemplazan las observaciones anteriores. `REVISIONES.observaciones`
conserva el comentario general de la decisión para compatibilidad.

Ejemplo del valor de `ETAPAS.K`:

```json
{
  "revision_1": [
    {
      "id_observacion": "obs-1729634400000-ab12cd",
      "formulario": "1",
      "paso": "2",
      "observacion": "Completar los datos del coordinador.",
      "estado": "pendiente",
      "id_usuario_autor": "user-1",
      "nombre_autor": "Revisor 1",
      "fecha_creacion": "2026-10-22T22:00:00.000Z",
      "fecha_actualizacion": "2026-10-22T22:00:00.000Z"
    }
  ],
  "revision_2": []
}
```

### 14.3.1 Agregar una observación independiente

```http
POST /workflow/:idSolicitud/observaciones
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

Body:

```json
{
  "etapa": "revision_2",
  "formulario": 2,
  "paso": 3,
  "observacion": "Revisar el soporte del fondo común."
}
```

`etapa` es opcional; si se omite, se usa la etapa actual de `ETAPAS`. Si se envía,
debe coincidir con la etapa actual; esto evita guardar una observación en una etapa
futura o en una etapa diferente de la que está siendo atendida. No se admiten
observaciones nuevas cuando la solicitud ya está `finalizado`.
`formulario` y `paso` también son opcionales si la observación aplica a toda la
etapa.

Respuesta `201`:

```json
{
  "success": true,
  "data": {
    "id_observacion": "15",
    "id_solicitud": "123",
    "etapa": "revision_2",
    "formulario": "2",
    "paso": "3",
    "observacion": "Revisar el soporte del fondo común.",
    "estado": "pendiente",
    "id_usuario_autor": "user-1",
    "nombre_autor": "Revisor",
    "fecha_creacion": "2026-10-22T22:00:00.000Z",
    "fecha_actualizacion": "2026-10-22T22:00:00.000Z"
  }
}
```

Para agregar una segunda observación, el frontend repite la misma petición con otro
texto. Cada observación tendrá su propio `id_observacion` y se agregará al JSON de
`ETAPAS.K`.

### 14.3.2 Consultar observaciones

```http
GET /workflow/:idSolicitud/observaciones
Authorization: Bearer <google-id-token>
```

Respuesta:

```json
{
  "success": true,
  "data": [
    {
      "id_observacion": "15",
      "id_solicitud": "123",
      "etapa": "revision_2",
      "formulario": "2",
      "paso": "3",
      "observacion": "Revisar el soporte del fondo común.",
      "estado": "pendiente",
      "id_usuario_autor": "user-1",
      "nombre_autor": "Revisor",
      "fecha_creacion": "2026-10-22T22:00:00.000Z",
      "fecha_actualizacion": "2026-10-22T22:00:00.000Z"
    }
  ]
}
```

### 14.3.3 Actualizar el texto o estado de una observación

```http
PATCH /workflow/:idSolicitud/observaciones/:idObservacion
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

Body para marcarla como subsanada:

```json
{
  "estado": "subsanada"
}
```

Estados permitidos:

```text
pendiente
subsanada
anulada
```

También se puede actualizar el texto:

```json
{
  "observacion": "Revisar nuevamente el soporte firmado."
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "id_observacion": "15",
    "id_solicitud": "123",
    "etapa": "revision_2",
    "formulario": "2",
    "paso": "3",
    "observacion": "Revisar nuevamente el soporte firmado.",
    "estado": "subsanada",
    "id_usuario_autor": "user-1",
    "nombre_autor": "Revisor",
    "fecha_creacion": "2026-10-22T22:00:00.000Z",
    "fecha_actualizacion": "2026-10-22T22:05:00.000Z"
  }
}
```

El autor puede modificar sus propias observaciones y un administrador puede modificar
cualquiera. Se conserva el objeto dentro del JSON y se cambia su estado; no se
elimina físicamente.

### 14.3.4 Agregar observaciones al aprobar o devolver

También se pueden crear varias observaciones independientes dentro de la misma
decisión usando el arreglo `observaciones`:

```http
POST /workflow/:idSolicitud/decision
```

```json
{
  "accion": "devolver",
  "comentario": "La solicitud requiere ajustes.",
  "observaciones": [
    {
      "formulario": 1,
      "paso": 2,
      "observacion": "Completar los datos del coordinador."
    },
    {
      "formulario": 2,
      "paso": 3,
      "observacion": "Revisar el valor del fondo común."
    }
  ]
}
```

La respuesta incluye los objetos agregados al JSON:

```json
{
  "success": true,
  "data": {
    "id_solicitud": "123",
    "etapa_codigo": "solicitud",
    "estado_etapa": "devuelta",
    "observaciones": [
      {
        "id_observacion": "15",
        "observacion": "Completar los datos del coordinador.",
        "estado": "pendiente"
      },
      {
        "id_observacion": "16",
        "observacion": "Revisar el valor del fondo común.",
        "estado": "pendiente"
      }
    ]
  }
}
```

### 14.3.4.1 Caso principal: cualquier etapa devuelve la solicitud

Cuando una solicitud está en una etapa que permite devolución, el responsable de esa
etapa puede registrar varias observaciones independientes y devolver la solicitud.
Por ejemplo, si está en `revision_1`, quedan guardadas dentro del arreglo
`ETAPAS.K.comentarios.revision_1`:

```json
{
  "revision_1": [
    {
      "id_observacion": "obs-1",
      "formulario": "1",
      "paso": "2",
      "observacion": "Completar los datos del coordinador.",
      "estado": "pendiente"
    },
    {
      "id_observacion": "obs-2",
      "formulario": "2",
      "paso": "3",
      "observacion": "Revisar el valor del fondo común.",
      "estado": "pendiente"
    }
  ]
}
```

La devolución se realiza con una sola llamada:

```http
POST /workflow/123/decision
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

```json
{
  "accion": "devolver",
  "comentario": "Por favor corregir las observaciones indicadas.",
  "observaciones": [
    {
      "formulario": 1,
      "paso": 2,
      "observacion": "Completar los datos del coordinador."
    },
    {
      "formulario": 2,
      "paso": 3,
      "observacion": "Revisar el valor del fondo común."
    }
  ]
}
```

El backend aplica estas transiciones:

1. Desde `revision_1`, agrega las observaciones en
   `ETAPAS.K.comentarios.revision_1` y vuelve a `solicitud` con estado `devuelta`.
2. Desde `revision_2`, agrega las observaciones en
   `ETAPAS.K.comentarios.revision_2` y vuelve a `solicitud` con estado `devuelta`.
3. Desde `presupuesto`, agrega las observaciones en
   `ETAPAS.K.comentarios.presupuesto` y vuelve a `revision_2` con estado `devuelta`.
   En `revision_2`, el revisor 2 puede subsanar esas observaciones o decidir si
   devuelve nuevamente la solicitud al solicitante.
4. Deja disponibles las observaciones para el solicitante.
5. Registra la decisión en `REVISIONES` y `HISTORIAL_ETAPAS`.

En `firmas` no existe una devolución: esa etapa únicamente espera las dos firmas.
Cuando ambas están registradas, la solicitud avanza a `decanato`.

### 14.3.4.2 Reglas de cierre por revisor en Decanato

- `revisor_1` y `revisor_2` pueden cerrar una solicitud únicamente cuando
  `ETAPAS.etapa_codigo` es `decanato`.
- El cierre exige `resultado` (`Aprobada` o `Rechazada`) y la resolución.
- El cierre se registra en `CORTES_DECANATO` y cambia `ETAPAS` a `finalizado`.
- Si la solicitud aún está en `revision_1` o `revision_2`, el revisor solo puede
  aprobar o devolver; no puede cerrarla allí.
- Presupuesto no cierra la solicitud; avanza a firmas.
- En firmas no hay devolución ni cierre por revisor.

El solicitante consulta la solicitud y sus observaciones con:

```http
GET /workflow/123/observaciones
Authorization: Bearer <google-id-token>
```

Cuando corrige cada punto, marca únicamente el estado de esa observación:

```http
PATCH /workflow/123/observaciones/obs-1
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

```json
{
  "estado": "subsanada"
}
```

El solicitante puede cambiar `pendiente` a `subsanada`, pero no puede modificar el
texto escrito por el revisor. El backend conserva el texto original y el identificador
de cada observación.

Para reenviar una solicitud devuelta, el frontend debe:

1. Consultar las observaciones.
2. Mostrar un checkbox por cada observación pendiente.
3. Marcar cada observación corregida con `PATCH /workflow/:idSolicitud/observaciones/:idObservacion`
   y el body `{ "estado": "subsanada" }`.
4. Habilitar el botón de reenvío solo cuando no existan observaciones pendientes.
5. Enviar la solicitud mediante `POST /enviarSolicitudRevision` o
   `POST /form/enviarSolicitudRevision`.


Cuando la última observación pendiente se marca como `subsanada`, el backend cambia
automáticamente los formularios que estaban en `Enviado a revisión` a
`Completado`. Así el solicitante puede editar nuevamente esos formularios antes de
reenviar la solicitud. Los formularios que ya estaban `Aprobado` no se modifican.

El reenvío conserva el punto de retorno de la devolución usando
`ETAPAS.etapa_anterior`:

- `revision_1` → `solicitud` → reenvío a `revision_1`.
- `revision_2` → `solicitud` → reenvío a `revision_2`.

Si la solicitud es nueva y nunca fue devuelta, el reenvío inicial continúa siendo:

```text
solicitud → revision_1
```

La respuesta de `POST /enviarSolicitudRevision` incluye `etapa_codigo` y
`rol_responsable` para que el frontend actualice la bandeja correcta.



El backend también valida esta regla. Si la solicitud está en
`etapa_codigo: solicitud` con `estado_etapa: devuelta` y todavía existe una
observación `pendiente`, el reenvío responde `409` con el código
`PENDING_OBSERVATIONS`. No es suficiente con ocultar o habilitar el botón en el
frontend.

### 14.3.5 Persistencia

No se requiere una hoja `OBSERVACIONES`. La fuente de verdad de estas observaciones
es `ETAPAS.K` (`comentarios`) como JSON agrupado por `etapa_codigo`.

### 14.4 Registrar firmas

```http
POST /workflow/:idSolicitud/firma
```

Content-Type: `multipart/form-data`.

El rol determina el tipo de firma: `solicitante` o `director_escuela`.

Body:

```json
{
  "evidencia_firma": "(archivo PNG, JPEG o WEBP)",
  "observaciones": "",
  "fecha_solicitud_firma": "2026-10-20T15:30:00.000Z"
}
```

Cuando existen ambas firmas, `ETAPAS` pasa a `decanato`, con `rol_responsable: decanato` y `estado_etapa: pendiente`. La imagen se carga al bucket mediante API HTTP y la URL se guarda en `FIRMAS.evidencia_firma`.

### 14.5 Crear o cerrar un corte de Decanato

```http
POST /workflow/cortes-decanato
```

La decisión se registra mediante esta ruta con `multipart/form-data`. Puede usarla
Decanato, el revisor 1 o el revisor 2, pero únicamente si la solicitud ya está en
la etapa `decanato`. El cierre aprobado o rechazado siempre se persiste en
`CORTES_DECANATO`.
Campos:

```json
{
  "id_solicitud": "123",
  "resultado": "Aprobada",
  "observaciones": "Aprobada por el comitÃ©.",
  "resolucion": "ResoluciÃ³n 230 de 2026",
  "pdf_resolucion": "(archivo PDF)"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "id_corte": "8",
    "id_solicitud": "123",
    "estado_corte": "finalizado",
    "resultado": "Aprobada",
    "resolucion": "https://storage.googleapis.com/...",
    "estado_final": "Aprobada",
    "etapa": {
      "etapa_codigo": "finalizado",
      "estado_etapa": "finalizado"
    }
  }
}
```

La resolución PDF cargada por Decanato se guarda en `CORTES_DECANATO.resolucion` y el resultado normalizado en `CORTES_DECANATO.estado_final`.

### 14.6 Hojas nuevas

```text
REVISIONES:
id_revision, id_solicitud, etapa, rol_revisor, id_usuario_revisor, estado, observaciones, fecha_inicio, fecha_respuesta, comentarios_por_formulario, numero_intento, id_usuario_toma, fecha_toma, resultado, resolucion

FIRMAS:
id_firma, id_solicitud, tipo_firma, id_firmante, nombre_firmante, estado, fecha_firma, evidencia_firma, observaciones, fecha_solicitud_firma

HISTORIAL_ETAPAS:
id_historial, id_solicitud, etapa, accion, estado_anterior, estado_nuevo, rol_actor, id_usuario_actor, fecha, comentario

CORTES_DECANATO:
id_corte, fecha_corte, id_solicitud, estado_corte, id_usuario_envia, fecha_envio, resultado, observaciones, resolucion, estado_final

```

### 14.7 Reglas para el frontend

- `revisor_1` y `revisor_2` consultan colas distintas.
- El botÃ³n de aprobar depende de `etapa_codigo`.
- Devolver requiere comentario; el rechazo definitivo se registra en Decanato.
- Presupuesto solo actÃºa en `presupuesto`.
- En firmas deben aparecer dos acciones independientes: solicitante y director.
- Decanato solo recibe solicitudes con las dos firmas.
- Decanato registra `estado_final`, carga su resolución y mueve la solicitud a
  `finalizado`. Revisor 1 y revisor 2 también pueden ejecutar este cierre, pero
  únicamente desde la etapa `decanato`.
- DespuÃ©s de cada acciÃ³n, el frontend debe volver a consultar la solicitud o la cola.
- `HISTORIAL_ETAPAS` puede mostrarse como lÃ­nea de tiempo.

## 17. ValidaciÃ³n de funcionalidades solicitadas por frontend

Esta tabla refleja el estado actual del backend.

| Funcionalidad | Estado | ImplementaciÃ³n |
|---|---|---|
| Solicitudes para revisor 1 | Implementado | `GET /workflow/cola` con rol `revisor_1`; incluye cierres pendientes en `decanato` |
| Solicitudes para revisor 2 | Implementado | `GET /workflow/cola` con rol `revisor_2`; incluye cierres pendientes en `decanato` |
| Solicitudes para presupuesto | Implementado | `GET /workflow/cola` con rol `presupuesto` |
| Solicitudes para decanato | Implementado | `GET /workflow/cola` con rol `decanato` |
| Solicitudes para director | Implementado | `GET /workflow/firmas/pendientes` |
| Estados globales | Implementado | `ETAPAS.estado_general` |
| Estados por formulario | Implementado | `ETAPAS.estado_formularios` como JSON |
| Etapa y estado del flujo | Implementado | `ETAPAS.etapa_codigo` y `ETAPAS.estado_etapa` |
| Historial de etapas | Implementado parcialmente | Se registra desde las nuevas rutas `/workflow`; las operaciones administrativas antiguas todavía deben migrarse completamente al historial |
| AuditorÃ­a del actor | Implementado en nuevas rutas | `HISTORIAL_ETAPAS.rol_actor` e `HISTORIAL_ETAPAS.id_usuario_actor` |
| Observaciones por formulario | Implementado | `comentarios_por_formulario` y `REVISIONES.comentarios_por_formulario` |
| Observaciones por paso | Implementado | `POST /guardarComentarioPaso` |
| Firma del solicitante | Implementado | `POST /workflow/:idSolicitud/firma` |
| Firma del director | Implementado | `POST /workflow/:idSolicitud/firma` autenticado con rol `director` |
| Envío al corte de Decanato | Implementado | `POST /workflow/cortes-decanato` |
| Resultado final de Decanato | Implementado | `CORTES_DECANATO.resultado` |
| Cierre por revisor 1/2 en Decanato | Implementado | `POST /workflow/cortes-decanato` con rol `revisor_1` o `revisor_2` |
| Nombre de resolución de Decanato | Implementado | `CORTES_DECANATO.resolucion` |
| PDF de resolución | Implementado | Decanato carga `pdf_resolucion` y se guarda la URL en `CORTES_DECANATO.resolucion` |
| Notificaciones por correo | Implementado | Firmas, recordatorios y envío automático a Decanato; se registra en `NOTIFICACIONES` |

### 17.1 Obtener solicitudes por rol

El frontend no debe enviar el rol en el body. El backend lo obtiene del usuario autenticado consultando `USUARIOS`.

```http
GET /workflow/cola
Authorization: Bearer <google_id_token>
```

Roles soportados actualmente por esta ruta:

```text
revisor_1
revisor_2
presupuesto
decanato
```

La respuesta contiene las solicitudes cuyo `rol_responsable` coincide con el rol
autenticado y cuyo `estado_etapa` es `pendiente`, `en_revision` o `devuelta`.
Excepción: para `revisor_1` y `revisor_2` también incluye solicitudes en etapa
`decanato`, aunque `rol_responsable` sea `decanato`, porque esos revisores pueden
cerrarlas desde esa etapa.

El director debe consultar `GET /workflow/firmas/pendientes` para su bandeja de firmas.

### 17.2 Estados que debe interpretar el frontend

Estado global heredado, en `ETAPAS.estado_general`:

```text
En proceso
Enviado a revisiÃ³n
Aprobado parcialmente
Aprobado
Terminado
```

Estado individual por formulario, dentro de `ETAPAS.estado_formularios`:

```json
{
  "1": "Enviado a revisiÃ³n",
  "2": "Aprobado",
  "3": "Requiere correcciones",
  "4": "En progreso"
}
```

Estados de la etapa nueva, en `ETAPAS.estado_etapa`:

```text
borrador
pendiente
en_revision
devuelta
rechazada
finalizado
```

### 17.3 Historial y auditorÃ­a

Las nuevas operaciones de workflow escriben en `HISTORIAL_ETAPAS`:

```json
{
  "id_solicitud": "123",
  "etapa": "revision_1",
  "accion": "aprobar",
  "estado_anterior": "en_revision",
  "estado_nuevo": "pendiente",
  "rol_actor": "revisor_1",
  "id_usuario_actor": "google-user-id",
  "fecha": "2026-10-20T15:30:00.000Z",
  "comentario": "RevisiÃ³n aprobada"
}
```

El frontend puede utilizar estos registros para construir una lÃ­nea de tiempo de la solicitud. Las operaciones antiguas bajo `/admin/*` conservan compatibilidad, pero su migraciÃ³n completa al historial debe considerarse pendiente.

### 17.4 Observaciones por formulario y paso

Para compatibilidad con el flujo antiguo, las observaciones resumidas por formulario
se siguen exponiendo en:

```json
{
  "comentarios_por_formulario": {
    "1": "Completar los datos del coordinador",
    "2": "Revisar el presupuesto"
  }
}
```

Para observaciones puntuales de un paso:

```http
POST /guardarComentarioPaso
```

```json
{
  "id_solicitud": "123",
  "userId": "google-user-id",
  "formulario": 2,
  "paso": 3,
  "comentario": "Validar el soporte del fondo comÃºn"
}
```

Un comentario vacÃ­o elimina el comentario guardado para ese formulario y paso.

### 17.5 Firmas

```http
POST /workflow/:idSolicitud/firma
```

El backend carga la imagen en la carpeta de Google Drive configurada en
`DRIVE_UPLOADS_FOLDER`, registra la URL en `FIRMAS.evidencia_firma` y, cuando existen
las dos firmas, mueve la solicitud a Decanato.

### 17.6 Corte y decisiÃ³n de Decanato

```http
POST /workflow/cortes-decanato
```

El body debe incluir:

```json
{
  "id_solicitud": "123",
  "estado_corte": "finalizado",
  "resultado": "Aprobada",
  "observaciones": "Aprobada por el comitÃ©",
  "resolucion": "ResoluciÃ³n 230 de 2026"
}
```

Decanato puede enviar también `pdf_resolucion`. Cuando el resultado es `Aprobada`,
el PDF es obligatorio; se carga al bucket mediante API HTTP y su URL se guarda en
`CORTES_DECANATO.resolucion`.

### 17.7 Notificaciones

Las notificaciones SMTP están implementadas únicamente para firma registrada y recordatorios de firma. El frontend debe consultar el estado devuelto y `NOTIFICACIONES`; no debe asumir que un correo fue entregado si el estado es `fallida` o `sin_destinatario`.

Los únicos eventos que activan correo son:

```text
firma_registrada
recordatorio_firma_solicitante
recordatorio_firma_director
```

## 18. Contrato vigente del workflow (octubre de 2026)

Esta sección reemplaza las notas anteriores que indicaban que las firmas, el PDF de
resolución y las notificaciones estaban pendientes. El prototipo
`Flujo de aprobación Extensión vertical.html` no forma parte del frontend productivo;
el frontend está en otro repositorio y debe consumir los contratos siguientes.

### 18.1 Máquina de estados única

El backend usa `ETAPAS.etapa_codigo` y `ETAPAS.estado_etapa` como fuente de verdad
del flujo. Los estados heredados (`estado_general` y `estado_formularios`) se conservan
para compatibilidad con formularios y reportes, pero cualquier transición del workflow
también actualiza la etapa nueva, su responsable, `etapa_anterior`, `updated_at` y
`version`.

```text
solicitud → revision_1 → revision_2 → presupuesto → firmas → decanato → finalizado
```

Los roles de las colas son `revisor_1`, `revisor_2`, `presupuesto` y `decanato`.
El solicitante y el director no tienen una cola de revisión: reciben acciones de firma
cuando la solicitud está en `firmas`.

### 18.2 Bandeja de firmas del director

```http
GET /workflow/firmas/pendientes
Authorization: Bearer <google-id-token>
```

Solo está disponible para usuarios con rol `director`. Devuelve solicitudes en etapa
`firmas` que todavía no tienen una firma `director_escuela`.

### 18.3 Registrar una firma

```http
POST /workflow/:idSolicitud/firma
Authorization: Bearer <google-id-token>
Content-Type: multipart/form-data
```

Campos:

- `evidencia_firma`: imagen PNG, JPEG o WEBP. Es obligatoria.
- `observaciones`: opcional.
- `fecha_solicitud_firma`: opcional.

El tipo de firma no lo decide el frontend:

- rol `solicitante` → `tipo_firma=solicitante`
- rol `director` → `tipo_firma=director_escuela`

El backend valida que la solicitud esté en `firmas`, que el solicitante sea el dueño
de la solicitud, que no exista una firma previa del mismo tipo y que el archivo sea
una imagen válida. La imagen se carga en Google Drive usando la autenticación configurada para las APIs
de Google y se guarda la URL resultante en `FIRMAS.evidencia_firma`. El frontend
mantiene el mismo contrato `multipart/form-data` y el campo `evidencia_firma`.

Después de registrar la firma, `FIRMAS.estado` queda en `firmada`. Cuando existen
ambas firmas (`solicitante` y `director_escuela`), `ETAPAS` pasa automáticamente a:

```text
etapa_codigo: decanato
rol_responsable: decanato
estado_etapa: pendiente
```

Mientras falte una firma, la solicitud permanece en `firmas` con
`estado_etapa: en_revision`.

### 18.4 Recordatorios de firma

```http
POST /workflow/:idSolicitud/firma/recordatorio
Authorization: Bearer <google-id-token>
Content-Type: application/json
```

Body:

```json
{
  "tipo_firma": "solicitante"
}
```

Valores permitidos: `solicitante` y `director_escuela`.

- El solicitante puede recordar al director.
- El director puede recordar al solicitante.
- Un administrador puede recordar a cualquiera.

### 18.5 Correos SMTP

El backend envía correo en estos cuatro eventos:

1. `firma_registrada`
2. `recordatorio_firma_solicitante`
3. `recordatorio_firma_director`
4. `solicitud_enviada_decanato`

Cuando se registra la segunda firma, la solicitud pasa a `decanato` y se envía
un correo a todos los usuarios de `USUARIOS` cuyo rol sea `decanato`. El frontend
puede agregar destinatarios sin reemplazar los destinatarios institucionales
enviando `destinatarios_decanato` como JSON o como direcciones separadas por coma:

```text
destinatarios_decanato: ["persona@ejemplo.edu.co", "otra@ejemplo.edu.co"]
```

También puede personalizar el correo mediante `asunto_decanato` y
`cuerpo_decanato`. Si no los envía, se usan los valores predeterminados del
backend. El cuerpo admite `{{id_solicitud}}`, `{{nombre_solicitante}}`,
`{{etapa}}` y `{{fecha}}`.

Variables:

```env
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=...
```

`SMTP_USER` y `SMTP_PASSWORD` son las únicas credenciales secretas requeridas para
SMTP. `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` y `SMTP_FROM` son configuración; si no
se define `SMTP_HOST`, se usa `smtp.gmail.com`.

Cada intento se registra en la hoja `NOTIFICACIONES`:

```text
id_notificacion
id_solicitud
evento
estado
intentos
fecha_creacion
fecha_envio
ultimo_error
```

Un fallo de correo no deshace una firma o una transición ya guardada. La respuesta
de la ruta de firma incluye `notificacion` y `notificaciones_decanato` con el
estado de cada envío para que el frontend pueda mostrarlo explícitamente.

### 18.5.1 Consulta de solicitudes y permisos de revisores

La cola operativa conserva los permisos por etapa:

- `revisor_1` puede actuar en `revision_1`.
- `revisor_2` puede actuar en `revision_2`.
- `presupuesto` puede actuar en `presupuesto`.
- `director` puede firmar en `firmas`.

Los revisores no pueden aprobar, devolver, agregar observaciones o cerrar una
solicitud fuera de su etapa aunque puedan consultarla. La consulta de solo lectura
se obtiene con:

```http
GET /workflow/solicitudes/consulta
```

`revisor_1` y `revisor_2` reciben todas las solicitudes. `presupuesto` recibe las
solicitudes en las que ya actuó según `HISTORIAL_ETAPAS` y las que avanzaron desde
presupuesto. `director` recibe las solicitudes que están pendientes de su firma y
las que ya tienen su firma registrada, aunque luego hayan avanzado a Decanato o
finalizado.

Cada resultado incluye `puede_actuar`, que solo es informativo; los endpoints de
escritura vuelven a validar rol y etapa en el backend.

### 18.6 Decanato registra la decisión y carga la resolución

```http
POST /workflow/cortes-decanato
Authorization: Bearer <google-id-token>
Content-Type: multipart/form-data
```

Solo el rol `decanato` puede usar esta ruta. La solicitud debe estar en etapa
`decanato`.

Campos:

- `id_solicitud`: obligatorio.
- `resultado`: obligatorio, por ejemplo `Aprobada` o `Rechazada`.
- `observaciones`: opcional.
- `resolucion`: opcional si no se carga archivo.
- `pdf_resolucion`: obligatorio cuando el resultado es `Aprobada`; debe ser PDF.

El PDF se carga en la carpeta de Google Drive configurada en `DRIVE_UPLOADS_FOLDER`.
La URL se guarda en `CORTES_DECANATO.resolucion`; no se guardan metadatos adicionales
del archivo. La decisión se persiste con `CORTES_DECANATO.estado_final` y luego
`ETAPAS` pasa a `finalizado`.

### 18.7 Almacenamiento de adjuntos, firmas y resoluciones en Drive

Las firmas y resoluciones no se almacenan en Cloud Storage. Se suben mediante
`services/driveService.js` a la carpeta indicada por:

```env
DRIVE_UPLOADS_FOLDER=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`services/firebase.js` conserva únicamente la configuración del proyecto y bucket;
la carga real está en `services/storageService.js`.

Los objetos se organizan así:

```text
firmas/{id_solicitud}/solicitante-*.png
firmas/{id_solicitud}/director_escuela-*.png
resoluciones/{id_solicitud}/resolucion-*.pdf
```

El bucket debe permitir a la Service Account subir archivos. Si los objetos se
mantienen privados, el frontend no debe asumir que la URL de almacenamiento es
pública; debe usarse el mecanismo de acceso configurado para el bucket.

### 18.8 Columnas nuevas de `ETAPAS`

Además de las columnas existentes, el backend utiliza:

```text
etapa_anterior
updated_at
version
```

`version` se incrementa al actualizar la etapa. `updated_at` se guarda en formato
ISO 8601 y `etapa_anterior` conserva la etapa inmediatamente anterior cuando existe
una transición.

### 18.9 Integración del frontend

El frontend productivo debe:

- Enviar el token de Google en todas las rutas `/workflow`.
- Usar `multipart/form-data` para firmas y resolución.
- No enviar `tipo_firma` como autoridad; el backend lo deriva del rol autenticado.
- Consultar nuevamente la solicitud después de firmar o registrar la decisión.
- Mostrar `NOTIFICACIONES.estado` cuando una acción de correo sea fallida.
- Mostrar la cola de firmas del director con `GET /workflow/firmas/pendientes`.
- No simular persistencia local del flujo; el prototipo HTML es únicamente referencia
  visual.

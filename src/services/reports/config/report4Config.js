/**
 * Configuración específica para el reporte del Formulario 4
 */
export const report4Config = {
  title: 'Formulario 4 - [Nombre del formulario]',
  showHeader: true,
  
  transformData: (formData) => {
    console.log("🔄 Transformando datos para reporte 4 (frontend)");
    
    // Crear objeto vacío para resultado
    const transformedData = {};
    
    // 1. PRE-INICIALIZAR TODOS LOS CAMPOS POSIBLES
    // Lista completa de campos básicos
    const camposBasicos = [
      'id_solicitud', 'nombre_actividad', 'fecha_solicitud', 'nombre_solicitante',
      'dia', 'mes', 'anio',
      // Add other fields specific to form 4
    ];
    
    // Inicializar todos con cadenas vacías
    camposBasicos.forEach(campo => {
      transformedData[campo] = '';
    });
      
    // 2. COPIAR DATOS RECIBIDOS
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        transformedData[key] = formData[key];
      }
    });
      
    // 3. FORMATEAR CAMPOS ESPECIALES
      
    // Formatear fecha 
    if (formData.fecha_solicitud) {
      try {
        const fecha = new Date(formData.fecha_solicitud);
        transformedData.dia = fecha.getDate().toString().padStart(2, '0');
        transformedData.mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        transformedData.anio = fecha.getFullYear().toString();
      } catch (error) {
        console.warn("Error al formatear fecha, usando valores por defecto");
        const hoy = new Date();
        transformedData.dia = hoy.getDate().toString().padStart(2, '0');
        transformedData.mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
        transformedData.anio = hoy.getFullYear().toString();
      }
    }
    
    // 4. TRANSFORMACIONES ESPECÍFICAS PARA FORM 4
    // Add any specific transformations needed for form 4
    
    // 5. LIMPIEZA FINAL - eliminar placeholders no reemplazados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        transformedData[key] = '';
      }
    });
       
    return transformedData;
  },
    
  sheetsConfig: {
    sheetName: 'Formulario4',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social',
  watermark: false
};
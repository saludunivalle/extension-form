/**
 * Configuración simplificada para el reporte del Formulario 3 - Matriz de Riesgos
 */
export const report3Config = {
  title: 'F-08-MP-05-01-01 - Riesgos Potenciales',
  showHeader: true,
  
  transformData: (formData) => {
    console.log("🔄 Transformando datos para reporte 3 (frontend)");
    console.log("- DATOS ORIGINALES:", JSON.stringify(formData, null, 2));
    console.log("- Campo 'programa':", formData.programa);
    console.log("- Campos diseño:", {
      aplicaDiseno1: formData.aplicaDiseno1,
      aplicaDiseno2: formData.aplicaDiseno2,
      aplicaDiseno3: formData.aplicaDiseno3,
      aplicaDiseno4: formData.aplicaDiseno4
    });
    
    // Crear objeto vacío para resultado
    const transformedData = {};
    
    // 1. PRE-INICIALIZAR TODOS LOS CAMPOS POSIBLES
    // Lista completa de campos básicos
    const camposBasicos = [
      'id_solicitud', 'nombre_actividad', 'fecha_solicitud', 'nombre_solicitante',
      'dia', 'mes', 'anio', 'programa',
      
      // Propósito y comentario
      'proposito', 'comentario',
      
      // Campos para matriz de riesgos - Diseño
      'aplicaDiseno1', 'aplicaDiseno2', 'aplicaDiseno3', 'aplicaDiseno4',
      
      // Campos para matriz de riesgos - Locaciones
      'aplicaLocacion1', 'aplicaLocacion2', 'aplicaLocacion3', 'aplicaLocacion4', 'aplicaLocacion5',
      
      // Campos para matriz de riesgos - Desarrollo
      'aplicaDesarrollo1', 'aplicaDesarrollo2', 'aplicaDesarrollo3', 'aplicaDesarrollo4', 
      'aplicaDesarrollo5', 'aplicaDesarrollo6', 'aplicaDesarrollo7', 'aplicaDesarrollo8', 
      'aplicaDesarrollo9', 'aplicaDesarrollo10', 'aplicaDesarrollo11',
      
      // Campos para matriz de riesgos - Cierre
      'aplicaCierre1', 'aplicaCierre2', 'aplicaCierre3'
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
      
    // 4. CONVERTIR CAMPOS DE RIESGO A FORMATO "Sí/No aplica"
    const camposRiesgo = [
      // Diseño
      'aplicaDiseno1', 'aplicaDiseno2', 'aplicaDiseno3', 'aplicaDiseno4',
      // Locaciones
      'aplicaLocacion1', 'aplicaLocacion2', 'aplicaLocacion3', 'aplicaLocacion4', 'aplicaLocacion5',
      // Desarrollo
      'aplicaDesarrollo1', 'aplicaDesarrollo2', 'aplicaDesarrollo3', 'aplicaDesarrollo4', 
      'aplicaDesarrollo5', 'aplicaDesarrollo6', 'aplicaDesarrollo7', 'aplicaDesarrollo8', 
      'aplicaDesarrollo9', 'aplicaDesarrollo10', 'aplicaDesarrollo11',
      // Cierre
      'aplicaCierre1', 'aplicaCierre2', 'aplicaCierre3'
    ];
      
    camposRiesgo.forEach(campo => {
      const valor = transformedData[campo];
      // Simplificar la lógica de conversión
      const esAfirmativo = 
        valor === true || 
        (typeof valor === 'string' && ['sí', 'si', 's', 'yes', 'y', 'true'].includes(valor.toString().toLowerCase()));
    
      transformedData[campo] = esAfirmativo ? 'Sí aplica' : 'No aplica';
    });
      
    // 5. VALORES POR DEFECTO PARA CAMPOS CRÍTICOS
    if (!transformedData.proposito) transformedData.proposito = 'No especificado';
    if (!transformedData.comentario) transformedData.comentario = 'No especificado';
    if (!transformedData.programa) transformedData.programa = 'No especificado';
      
    // 6. LIMPIEZA FINAL - eliminar placeholders no reemplazados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        transformedData[key] = '';
      }
    });
       
    return transformedData;
  },
    
  sheetsConfig: {
    sheetName: 'Formulario3',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social - Matriz de Riesgos',
  watermark: false
};
/**
 * Configuración específica para el reporte del Formulario 2 - Presupuesto
 * Implementación optimizada para marcado directo en Google Sheets y manejo de placeholders
 */
export const report2Config = {
  title: 'Formulario de Presupuesto - F-05-MP-05-01-02',
  showHeader: true,
  
  // Función para transformar los datos para Google Sheets
  transformData: (allSheetData) => {
    // Crear un objeto nuevo vacío
    const transformedData = {};
    
    // Obtener los datos específicos de SOLICITUDES2 y GASTOS
    const solicitudData = allSheetData || {};
    const gastosData = Array.isArray(allSheetData.gastos) ? allSheetData.gastos : [];
    
    console.log("🔄 Transformando datos para reporte de presupuesto:", solicitudData);
    console.log(`📊 Procesando ${gastosData.length} gastos para el reporte`);
    
    // Inicializar campos base
    transformedData.id_solicitud = solicitudData.id_solicitud || '';
    transformedData.fecha_solicitud = solicitudData.fecha_solicitud || '';
    transformedData.nombre_actividad = solicitudData.nombre_actividad || '';
    transformedData.nombre_solicitante = solicitudData.nombre_solicitante || '';
    
    // Datos de ingresos
    transformedData.ingresos_cantidad = solicitudData.ingresos_cantidad || '';
    transformedData.ingresos_vr_unit = solicitudData.ingresos_vr_unit || '';
    transformedData.total_ingresos = solicitudData.total_ingresos || '';
    
    // Datos de gastos principales
    transformedData.subtotal_gastos = solicitudData.subtotal_gastos || '';
    transformedData.imprevistos_3 = solicitudData.imprevistos_3 || '';
    transformedData.total_gastos_imprevistos = solicitudData.total_gastos_imprevistos || '';
    
    // Datos de distribución de excedentes
    transformedData.fondo_comun_porcentaje = solicitudData.fondo_comun_porcentaje || '30';
    transformedData.facultadad_instituto_porcentaje = solicitudData.facultadad_instituto_porcentaje || '5';
    transformedData.escuela_departamento_porcentaje = solicitudData.escuela_departamento_porcentaje || '0';
    
    // Intentar recuperar datos guardados localmente si los datos del servidor están incompletos
    if (!solicitudData.ingresos_cantidad || !solicitudData.ingresos_vr_unit) {
      try {
        const localDataKey = `solicitud2_data_${allSheetData.id_solicitud}`;
        const localData = JSON.parse(localStorage.getItem(localDataKey) || "{}");
        
        if (localData.ingresos_cantidad && localData.ingresos_vr_unit) {
          console.log("📋 Completando datos faltantes desde almacenamiento local");
          
          // Usar datos locales para complementar los del servidor
          transformedData.ingresos_cantidad = localData.ingresos_cantidad || transformedData.ingresos_cantidad;
          transformedData.ingresos_vr_unit = localData.ingresos_vr_unit || transformedData.ingresos_vr_unit;
          transformedData.total_ingresos = localData.total_ingresos || transformedData.total_ingresos;
          transformedData.subtotal_gastos = localData.subtotal_gastos || transformedData.subtotal_gastos;
          transformedData.imprevistos_3 = localData.imprevistos_3 || transformedData.imprevistos_3;
          transformedData.total_gastos_imprevistos = localData.total_gastos_imprevistos || transformedData.total_gastos_imprevistos;
        }
      } catch (e) {
        console.warn("No se pudieron recuperar datos locales", e);
      }
    }

    // Función para formatear valores monetarios
    const formatCurrency = (value) => {
      if (!value && value !== 0) return '';
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return value;
      
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    };
    
    // Formatear la fecha
    if (solicitudData.fecha_solicitud) {
      const date = new Date(solicitudData.fecha_solicitud);
      transformedData.dia = date.getDate().toString().padStart(2, '0');
      transformedData.mes = (date.getMonth() + 1).toString().padStart(2, '0');
      transformedData.anio = date.getFullYear().toString();
    } else {
      transformedData.dia = '';
      transformedData.mes = '';
      transformedData.anio = '';
    }
    
    // IMPORTANTE: Pre-inicializar todos los posibles campos de gastos comunes
    // para evitar problemas con los placeholders en la plantilla
    const conceptosComunes = [
      '1', '1,1', '1,2', '1,3', '2', '3', '4', '5', '6', '7', '7,1', '7,2', 
      '7,3', '7,4', '7,5', '8', '8,1', '8,2', '8,3', '8,4', '9', '9,1', '9,2', 
      '9,3', '10', '11', '12', '13', '14', '15'
    ];
    
    // Pre-inicializar todos los campos de gastos comunes con valores vacíos
    conceptosComunes.forEach(concepto => {
      transformedData[`gasto_${concepto}_cantidad`] = '0';
      transformedData[`gasto_${concepto}_valor_unit`] = formatCurrency(0);
      transformedData[`gasto_${concepto}_valor_total`] = formatCurrency(0);
      transformedData[`gasto_${concepto}_descripcion`] = `Concepto ${concepto}`;
    });
    
    // Procesar gastos dinámicos reales
    if (gastosData && gastosData.length > 0) {
      console.log(`Procesando ${gastosData.length} gastos reales para el reporte`);
      
      const gastosPorConcepto = {};
      
      gastosData.forEach(gasto => {
        if (!gasto || !gasto.id_conceptos) {
          console.warn("⚠️ Se encontró un gasto sin ID de concepto:", gasto);
          return;
        }
        
        const idConcepto = gasto.id_conceptos;
        gastosPorConcepto[idConcepto] = {
          cantidad: gasto.cantidad || 0,
          valor_unit: gasto.valor_unit || 0,
          valor_total: gasto.valor_total || 0,
          descripcion: gasto.descripcion || `Concepto ${idConcepto}`
        };
        
        // Generar los campos esperados por el template con datos reales
        transformedData[`gasto_${idConcepto}_cantidad`] = (gasto.cantidad || 0).toString();
        transformedData[`gasto_${idConcepto}_valor_unit`] = formatCurrency(gasto.valor_unit || 0);
        transformedData[`gasto_${idConcepto}_valor_total`] = formatCurrency(gasto.valor_total || 0);
        transformedData[`gasto_${idConcepto}_descripcion`] = gasto.descripcion || `Concepto ${idConcepto}`;
      });
      
      // Lista de conceptos para referencia
      transformedData.conceptos_lista = Object.keys(gastosPorConcepto).join(',');
      transformedData.conceptos_total = Object.keys(gastosPorConcepto).length.toString();
    } else {
      console.warn("No se encontraron gastos para esta solicitud. Usando placeholders por defecto.");
      transformedData.conceptos_lista = conceptosComunes.join(',');
      transformedData.conceptos_total = '0';
    }
    
    // Formatear valores monetarios específicos
    const monetaryFields = [
      'ingresos_vr_unit', 'total_ingresos', 'subtotal_gastos', 
      'imprevistos_3', 'total_gastos_imprevistos'
    ];
    
    monetaryFields.forEach(field => {
      if (transformedData[field]) {
        transformedData[field] = formatCurrency(transformedData[field]);
      }
    });
    
    // Limpiar posibles placeholders sin reemplazar
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        console.log(`⚠️ Eliminando marcador no reemplazado en campo ${key}: "${value}"`);
        transformedData[key] = '';
      }
    });
    
    console.log("✅ Datos transformados para reporte:", transformedData);
    return transformedData;
  },
  
  // Configuración adicional específica para Google Sheets
  sheetsConfig: {
    sheetName: 'Formulario2',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social - Presupuesto',
  watermark: false
};
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
    // CAMBIO: Convertir las comas a guiones bajos para evitar problemas
    const conceptosComunes = [
      '1', '1_1', '1_2', '1_3', '2', '3', '4', '5', '6', '7', '7_1', '7_2', 
      '7_3', '7_4', '7_5', '8', '8_1', '8_2', '8_3', '8_4', '9', '9_1', '9_2', 
      '9_3', '10', '11', '12', '13', '14', '15'
    ];
    
    // Pre-inicializar todos los campos de gastos comunes con valores vacíos
    conceptosComunes.forEach(concepto => {
      transformedData[`gasto_${concepto}_cantidad`] = '0';
      transformedData[`gasto_${concepto}_valor_unit`] = formatCurrency(0);
      transformedData[`gasto_${concepto}_valor_total`] = formatCurrency(0);
      transformedData[`gasto_${concepto}_descripcion`] = `Concepto ${concepto.replace('_', ',')}`;
    });
    
    // Procesar gastos dinámicos reales
    if (gastosData && gastosData.length > 0) {
      console.log(`Procesando ${gastosData.length} gastos reales para el reporte`);
      
      // Añadir un log detallado para depuración
      console.log("🧾 Lista completa de IDs de gastos recibidos:", 
        gastosData.map(g => g.id_conceptos).sort().join(', '));
        
      const gastosPorConcepto = {};
      
      // Separamos los gastos en regulares y dinámicos (15.x)
      const gastosRegulares = gastosData.filter(g => !g.id_conceptos.startsWith('15.'));
      const gastosDinamicos = gastosData.filter(g => g.id_conceptos.startsWith('15.'));
      
      console.log(`- Procesando ${gastosRegulares.length} gastos regulares`);
      console.log(`- Procesando ${gastosDinamicos.length} gastos dinámicos`);
      
      // Procesar gastos regulares
      gastosRegulares.forEach(gasto => {
        if (!gasto || !gasto.id_conceptos) {
          console.warn("⚠️ Se encontró un gasto sin ID de concepto:", gasto);
          return;
        }
        
        // CAMBIO: Convertir comas a guiones bajos en el ID del concepto
        const idConceptoOriginal = gasto.id_conceptos;
        const idConcepto = idConceptoOriginal.replace(/,/g, '_');
        
        gastosPorConcepto[idConcepto] = {
          cantidad: gasto.cantidad || 0,
          valor_unit: gasto.valor_unit || 0,
          valor_total: gasto.valor_total || 0,
          descripcion: gasto.descripcion || `Concepto ${idConceptoOriginal}`
        };
        
        // Usar el ID con guiones bajos para las claves
        transformedData[`gasto_${idConcepto}_cantidad`] = (gasto.cantidad || 0).toString();
        transformedData[`gasto_${idConcepto}_valor_unit`] = formatCurrency(gasto.valor_unit || 0);
        transformedData[`gasto_${idConcepto}_valor_total`] = formatCurrency(gasto.valor_total || 0);
        transformedData[`gasto_${idConcepto}_descripcion`] = gasto.descripcion || `Concepto ${idConceptoOriginal}`;
        
        // NUEVO: También almacenar con el formato original para compatibilidad
        transformedData[`gasto_${idConceptoOriginal}_cantidad`] = (gasto.cantidad || 0).toString();
        transformedData[`gasto_${idConceptoOriginal}_valor_unit`] = formatCurrency(gasto.valor_unit || 0);
        transformedData[`gasto_${idConceptoOriginal}_valor_total`] = formatCurrency(gasto.valor_total || 0);
        transformedData[`gasto_${idConceptoOriginal}_descripcion`] = gasto.descripcion || `Concepto ${idConceptoOriginal}`;
      });
      
      // Generar estructura para gastos dinámicos (15.x)
      if (gastosDinamicos.length > 0) {
        // Formatear gastos dinámicos para el sistema de plantillas
        transformedData.gastos_dinamicos_data = gastosDinamicos.map(g => ({
          id: g.id_conceptos,
          nombre: g.concepto || g.descripcion || `Gasto Extra ${g.id_conceptos.split('.')[1]}`,
          cantidad: g.cantidad,
          valor_unit: formatCurrency(g.valor_unit || 0),
          valor_total: formatCurrency(g.valor_total || 0)
        }));
        
        // Indicar cuántos gastos dinámicos hay
        transformedData.gastos_dinamicos_count = gastosDinamicos.length.toString();
        
        // También registrar cada gasto dinámico individualmente
        gastosDinamicos.forEach(gasto => {
          const idConcepto = gasto.id_conceptos;
          const idConceptoNormalizado = idConcepto.replace(/\./g, '_');
          
          // Usar ambos formatos para compatibilidad
          transformedData[`gasto_${idConcepto}_cantidad`] = (gasto.cantidad || 0).toString();
          transformedData[`gasto_${idConcepto}_valor_unit`] = formatCurrency(gasto.valor_unit || 0);
          transformedData[`gasto_${idConcepto}_valor_total`] = formatCurrency(gasto.valor_total || 0);
          transformedData[`gasto_${idConcepto}_descripcion`] = gasto.concepto || gasto.descripcion || 
                                                            `Gasto Extra ${idConcepto.split('.')[1]}`;
                                                            
          transformedData[`gasto_${idConceptoNormalizado}_cantidad`] = (gasto.cantidad || 0).toString();
          transformedData[`gasto_${idConceptoNormalizado}_valor_unit`] = formatCurrency(gasto.valor_unit || 0);
          transformedData[`gasto_${idConceptoNormalizado}_valor_total`] = formatCurrency(gasto.valor_total || 0);
          transformedData[`gasto_${idConceptoNormalizado}_descripcion`] = gasto.concepto || gasto.descripcion || 
                                                            `Gasto Extra ${idConcepto.split('.')[1]}`;
        });
      } else {
        transformedData.gastos_dinamicos_data = [];
        transformedData.gastos_dinamicos_count = "0";
      }
      
      // Generar listas de conceptos
      const conceptosKeys = Object.keys(gastosPorConcepto);
      transformedData.conceptos_lista = conceptosKeys.map(k => k.replace(/_/g, ',')).join(',');
      transformedData.conceptos_total = conceptosKeys.length.toString();
    } else {
      console.warn("No se encontraron gastos para esta solicitud. Usando placeholders por defecto.");
      transformedData.conceptos_lista = conceptosComunes.map(c => c.replace(/_/g, ',')).join(',');
      transformedData.conceptos_total = '0';
      transformedData.gastos_dinamicos_data = [];
      transformedData.gastos_dinamicos_count = "0";
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
    
    // NUEVO: Asegurarnos de que los campos para la plantilla existan con ambos formatos
    // Identificar las claves de template usadas en la plantilla
    const templateKeys = [
      '1,1', '1,2', '1,3', '2', '3', '4', '5', '6', '7', '7,1', '7,2', 
      '7,3', '7,4', '7,5', '8', '8,1', '8,2', '8,3', '8,4', '9', '9,1', '9,2', 
      '9,3', '10', '11', '12', '13', '14', '15'
    ];
    
    // Crear entradas explícitas para cada clave de template
    templateKeys.forEach(key => {
      const normalizedKey = key.replace(/,/g, '_');
      // Probar múltiples formatos posibles
      const keyWithDots = key.replace(/,/g, '.');
      
      // Comprobar todas las posibles versiones del campo
      if (transformedData[`gasto_${normalizedKey}_cantidad`]) {
        transformedData[`gasto_${key}_cantidad`] = transformedData[`gasto_${normalizedKey}_cantidad`];
        transformedData[`gasto_${key}_valor_unit`] = transformedData[`gasto_${normalizedKey}_valor_unit`];
        transformedData[`gasto_${key}_valor_total`] = transformedData[`gasto_${normalizedKey}_valor_total`];
      } 
      else if (transformedData[`gasto_${keyWithDots}_cantidad`]) {
        transformedData[`gasto_${key}_cantidad`] = transformedData[`gasto_${keyWithDots}_cantidad`];
        transformedData[`gasto_${key}_valor_unit`] = transformedData[`gasto_${keyWithDots}_valor_unit`];
        transformedData[`gasto_${key}_valor_total`] = transformedData[`gasto_${keyWithDots}_valor_total`];
      }
      // Si no existe en ningún formato, crear un valor predeterminado
      else {
        transformedData[`gasto_${key}_cantidad`] = '0';
        transformedData[`gasto_${key}_valor_unit`] = '$0';
        transformedData[`gasto_${key}_valor_total`] = '$0';
        console.log(`⚠️ Creando campos predeterminados para gasto_${key}`);
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
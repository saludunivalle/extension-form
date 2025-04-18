/**
 * Configuración simplificada para el reporte del Formulario 2 - Presupuesto
 * Usando enfoque declarativo como en report1Config
 */
export const report2Config = {
  title: 'Formulario de Presupuesto - F-05-MP-05-01-02',
  showHeader: true,
  
  transformData: (formData) => {
    console.log("🔄 Transformando datos para reporte 2 (frontend)");
    console.log("📋 Datos recibidos:", JSON.stringify(formData, null, 2));
    
    // Crear objeto vacío para resultado
    const transformedData = {};
    
    // 1. PRE-INICIALIZAR TODOS LOS CAMPOS POSIBLES
    // Lista completa de campos básicos
    const camposBasicos = [
      'id_solicitud', 'nombre_actividad', 'fecha_solicitud', 'nombre_solicitante',
      'dia', 'mes', 'anio',
      'ingresos_cantidad', 'ingresos_vr_unit', 'total_ingresos',
      'subtotal_gastos', 'imprevistos_3', 'imprevistos_3%', 'total_gastos_imprevistos',
      'fondo_comun_porcentaje', 'fondo_comun','facultadad_instituto_porcentaje', 
      'escuela_departamento_porcentaje', 'escuela_departamento','total_recursos',
    ];
    
    // Inicializar todos con cadenas vacías
    camposBasicos.forEach(campo => {
      transformedData[campo] = '';
    });
    
    // 2. PRE-INICIALIZAR CAMPOS DE GASTOS
    // Lista completa de IDs de gastos (usando formato con coma que es el de la plantilla)
    const conceptosGastos = [
      '1', '1,1', '1,2', '1,3', '2', '3', '4', '5', '6', '7', '7,1', '7,2', 
      '7,3', '7,4', '7,5', '8', '8,1', '8,2', '8,3', '8,4', '9', '9,1', '9,2', 
      '9,3', '10', '11', '12', '13', '14', '15'
    ];
    
    // Crear todos los campos para cada concepto
    conceptosGastos.forEach(concepto => {
      transformedData[`gasto_${concepto}_cantidad`] = '0';
      transformedData[`gasto_${concepto}_valor_unit`] = '$0';
      transformedData[`gasto_${concepto}_valor_total`] = '$0';
      transformedData[`gasto_${concepto}_descripcion`] = '';
    });
    
    // 3. COPIAR DATOS RECIBIDOS
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        transformedData[key] = formData[key];
      }
    });
    
    // 4. FORMATEAR CAMPOS ESPECIALES
    
    // Función mejorada para formatear moneda
    const formatCurrency = (value) => {
      if (!value && value !== 0) return '$0';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '$0';
      
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numValue);
    };
    
    // Formatear fecha 
    if (formData.fecha_solicitud) {
      try {
        const fecha = new Date(formData.fecha_solicitud);
        transformedData.dia = fecha.getDate().toString().padStart(2, '0');
        transformedData.mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        transformedData.anio = fecha.getFullYear().toString();
        console.log(`✅ Fecha procesada: dia=${transformedData.dia}, mes=${transformedData.mes}, anio=${transformedData.anio}`);
      } catch (error) {
        console.warn("Error al formatear fecha, usando valores por defecto");
        const hoy = new Date();
        transformedData.dia = hoy.getDate().toString().padStart(2, '0');
        transformedData.mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
        transformedData.anio = hoy.getFullYear().toString();
      }
    }
    
    // Procesar campos de ingresos asegurando valores numéricos correctos
    const ingresos_cantidad = parseFloat(formData.ingresos_cantidad) || 0;
    const ingresos_vr_unit = parseFloat(formData.ingresos_vr_unit) || 0;
    const total_ingresos = ingresos_cantidad * ingresos_vr_unit;
    
    // Asignar valores procesados
    transformedData.ingresos_cantidad = ingresos_cantidad.toString();
    transformedData.ingresos_vr_unit = ingresos_vr_unit.toString();
    transformedData.total_ingresos = total_ingresos.toString();
    
    console.log(`✅ Valores de ingresos: cantidad=${ingresos_cantidad}, valorUnit=${ingresos_vr_unit}, total=${total_ingresos}`);
    
    // Formatear valores monetarios y asegurar cálculos correctos
    const subtotal_gastos = parseFloat(formData.subtotal_gastos) || 0;
    // Usar exactamente 3% para imprevistos
    const imprevistos_valor = subtotal_gastos * 0.03;
    const total_gastos_imprevistos = subtotal_gastos + imprevistos_valor;

    // Asignar los valores calculados
    transformedData.subtotal_gastos = formatCurrency(subtotal_gastos);
    transformedData.imprevistos_3 = formatCurrency(imprevistos_valor);
    transformedData['imprevistos_3%'] = '3'; // Fijar el porcentaje en 3%
    transformedData.total_gastos_imprevistos = formatCurrency(total_gastos_imprevistos);
    
    console.log(`✅ Cálculos de gastos: subtotal=${subtotal_gastos}, imprevistos(3%)=${imprevistos_valor}, total=${total_gastos_imprevistos}`);
    
    // Calcular los valores monetarios a partir de los porcentajes para fondos
    // Reutilizar el valor de total_ingresos ya calculado
    const ingresosTotales = parseFloat(formData.total_ingresos) || total_ingresos;
    
    // Obtener porcentajes (usar valores por defecto si no existen)
    const fondo_comun_porcentaje = parseFloat(formData.fondo_comun_porcentaje) || 30;
    const facultad_instituto_porcentaje = 5; // Fijo en 5%
    const escuela_departamento_porcentaje = parseFloat(formData.escuela_departamento_porcentaje) || 0;
    
    // Calcular valores monetarios
    const fondo_comun_valor = ingresosTotales * (fondo_comun_porcentaje / 100);
    const facultad_instituto_valor = ingresosTotales * (facultad_instituto_porcentaje / 100);
    const escuela_departamento_valor = ingresosTotales * (escuela_departamento_porcentaje / 100);
    
    // Calcular total de recursos
    const total_recursos = fondo_comun_valor + facultad_instituto_valor + escuela_departamento_valor;
    
    // Asignar valores calculados
    transformedData.fondo_comun_porcentaje = fondo_comun_porcentaje.toString();
    transformedData.fondo_comun = fondo_comun_valor.toString();
    transformedData.fondo_comun_formatted = formatCurrency(fondo_comun_valor);
    
    transformedData.facultad_instituto_porcentaje = facultad_instituto_porcentaje.toString();
    transformedData.facultad_instituto = facultad_instituto_valor.toString();
    transformedData.facultad_instituto_formatted = formatCurrency(facultad_instituto_valor);
    
    transformedData.escuela_departamento_porcentaje = escuela_departamento_porcentaje.toString();
    transformedData.escuela_departamento = escuela_departamento_valor.toString();
    transformedData.escuela_departamento_formatted = formatCurrency(escuela_departamento_valor);
    
    transformedData.total_recursos = total_recursos.toString();
    transformedData.total_recursos_formatted = formatCurrency(total_recursos);
    
    console.log(`✅ Cálculos de aportes: fondo_comun(${fondo_comun_porcentaje}%)=${fondo_comun_valor}, facultad(5%)=${facultad_instituto_valor}, escuela(${escuela_departamento_porcentaje}%)=${escuela_departamento_valor}, total=${total_recursos}`);
    
    // 5. VALORES POR DEFECTO PARA CAMPOS CRÍTICOS
    if (!transformedData.fondo_comun_porcentaje) transformedData.fondo_comun_porcentaje = '30';
    if (!transformedData.facultadad_instituto_porcentaje) transformedData.facultadad_instituto_porcentaje = '5';
    if (!transformedData.escuela_departamento_porcentaje) transformedData.escuela_departamento_porcentaje = '0';
    if (!transformedData['imprevistos_3%']) transformedData['imprevistos_3%'] = '3';
    
    // 6. PROCESAR GASTOS
    // Separar los gastos normales de los dinámicos (los que tienen ID que empieza por 15.)
    const gastosNormales = [];
    const gastosDinamicos = [];
    
    if (Array.isArray(formData.gastos) && formData.gastos.length > 0) {
      console.log(`Procesando ${formData.gastos.length} gastos`);
      
      formData.gastos.forEach(gasto => {
        if (!gasto.id_conceptos) return;
        
        // Procesar el gasto con valores formateados
        const cantidad = parseFloat(gasto.cantidad) || 0;
        const valorUnit = parseFloat(gasto.valor_unit) || 0;
        const valorTotal = parseFloat(gasto.valor_total) || cantidad * valorUnit;
        
        // Formatear valores monetarios
        const valorUnit_formatted = formatCurrency(valorUnit);
        const valorTotal_formatted = formatCurrency(valorTotal);
        
        // Crear objeto de gasto procesado
        const gastoProcesado = {
          id: gasto.id_conceptos,
          id_concepto: gasto.id_conceptos,
          descripcion: gasto.descripcion || '',
          cantidad: cantidad,
          valorUnit: valorUnit,
          valorTotal: valorTotal,
          valor_unit: valorUnit,
          valor_total: valorTotal,
          valorUnit_formatted: valorUnit_formatted,
          valorTotal_formatted: valorTotal_formatted,
          valor_unit_formatted: valorUnit_formatted,
          valor_total_formatted: valorTotal_formatted
        };
        
        // Determinar si es un gasto dinámico (ID que empieza por 15.)
        if (gasto.id_conceptos.startsWith('15.')) {
          gastosDinamicos.push(gastoProcesado);
          console.log(`🔄 Gasto dinámico procesado: ID=${gasto.id_conceptos}, Total=${valorTotal_formatted}`);
        } else {
          gastosNormales.push(gastoProcesado);
          
          // La plantilla usa formato con coma (1,1)
          const idConComa = gasto.id_conceptos.replace(/\./g, ',');
          
          // Asignar valores al objeto transformedData
          transformedData[`gasto_${idConComa}_cantidad`] = cantidad.toString();
          transformedData[`gasto_${idConComa}_valor_unit`] = valorUnit.toString();
          transformedData[`gasto_${idConComa}_valor_unit_formatted`] = valorUnit_formatted;
          transformedData[`gasto_${idConComa}_valor_total`] = valorTotal.toString();
          transformedData[`gasto_${idConComa}_valor_total_formatted`] = valorTotal_formatted;
          transformedData[`gasto_${idConComa}_descripcion`] = gasto.descripcion || '';
          
          console.log(`✅ Gasto normal procesado: ID=${idConComa}, Total=${valorTotal_formatted}`);
        }
      });
      
      // Si hay gastos dinámicos, añadirlos al objeto para procesamiento especial
      if (gastosDinamicos.length > 0) {
        console.log(`Procesando ${gastosDinamicos.length} gastos dinámicos para el reporte`);
        
        // Asegurarnos de que los gastos tienen el formato correcto para la inserción
        const gastosProcesados = gastosDinamicos.map(gasto => {
          // Asegurarse de que tenemos el ID en formato correcto (con punto)
          const id = gasto.id?.replace(',', '.') || 
                     gasto.id_conceptos?.replace(',', '.') || '';
          
          // Formatear valores monetarios si no están formateados
          const formatCurrency = (value) => {
            if (!value && value !== 0) return '$0';
            const numValue = parseFloat(value);
            return isNaN(numValue) ? '$0' : 
              new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(numValue);
          };
          
          return {
            id: id,
            id_conceptos: id,
            descripcion: gasto.descripcion || gasto.concepto || '',
            concepto: gasto.descripcion || gasto.concepto || '',
            cantidad: gasto.cantidad?.toString() || '0',
            valorUnit: gasto.valorUnit || gasto.valor_unit || 0,
            valorUnit_formatted: gasto.valorUnit_formatted || gasto.valor_unit_formatted || 
                                 formatCurrency(gasto.valorUnit || gasto.valor_unit || 0),
            valorTotal: gasto.valorTotal || gasto.valor_total || 0,
            valorTotal_formatted: gasto.valorTotal_formatted || gasto.valor_total_formatted || 
                                  formatCurrency(gasto.valorTotal || gasto.valor_total || 0)
          };
        });
        
        // Configurar el objeto especial con la información necesaria
        transformedData['__FILAS_DINAMICAS__'] = {
          gastos: gastosProcesados,
          insertarEn: "A44:AK44",
          insertStartRow: 45
        };
        
        console.log(`✅ Configurados ${gastosDinamicos.length} gastos dinámicos para inserción en el reporte`);
      }
    }
    
    // 7. LIMPIEZA FINAL - eliminar placeholders no reemplazados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        transformedData[key] = '';
      }
    });
     
    console.log("✅ Datos de reporte 2 transformados:", JSON.stringify(transformedData, null, 2));
    return transformedData;
  },
  
  sheetsConfig: {
    sheetName: 'Formulario2',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social - Presupuesto',
  watermark: false
};
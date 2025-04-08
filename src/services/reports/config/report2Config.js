/**
 * Configuración simplificada para el reporte del Formulario 2 - Presupuesto
 * Usando enfoque declarativo como en report1Config
 */
export const report2Config = {
  title: 'Formulario de Presupuesto - F-05-MP-05-01-02',
  showHeader: true,
  
  transformData: (formData) => {
    console.log("🔄 Transformando datos para reporte 2 (frontend)");
    
    // Crear objeto vacío para resultado
    const transformedData = {};
    
    // 1. PRE-INICIALIZAR TODOS LOS CAMPOS POSIBLES
    // Lista completa de campos básicos
    const camposBasicos = [
      'id_solicitud', 'nombre_actividad', 'fecha_solicitud', 'nombre_solicitante',
      'dia', 'mes', 'anio',
      'ingresos_cantidad', 'ingresos_vr_unit', 'total_ingresos',
      'subtotal_gastos', 'imprevistos_3', 'imprevistos_3%', 'total_gastos_imprevistos',
      'fondo_comun_porcentaje', 'facultadad_instituto_porcentaje', 
      'escuela_departamento_porcentaje', 'total_recursos',
      'observaciones', 'responsable_financiero',
      'subtotal_costos_directos', 'costos_indirectos_cantidad', 
      'administracion_cantidad', 'descuentos_cantidad',
      'total_costo_actividad', 'excedente_cantidad', 'valor_inscripcion_individual'
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
      } catch (error) {
        console.warn("Error al formatear fecha, usando valores por defecto");
        const hoy = new Date();
        transformedData.dia = hoy.getDate().toString().padStart(2, '0');
        transformedData.mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
        transformedData.anio = hoy.getFullYear().toString();
      }
    }
    
    // Formatear valores monetarios y asegurar cálculos correctos
    const subtotal_gastos = parseFloat(formData.subtotal_gastos) || 0;
    const imprevistos_porcentaje = parseFloat(formData['imprevistos_3%'] || 3);
    const imprevistos_valor = subtotal_gastos * (imprevistos_porcentaje / 100);
    const total_gastos_imprevistos = subtotal_gastos + imprevistos_valor;

    // Asignar los valores calculados
    transformedData.subtotal_gastos = formatCurrency(subtotal_gastos);
    transformedData.imprevistos_3 = formatCurrency(imprevistos_valor);
    transformedData['imprevistos_3%'] = imprevistos_porcentaje.toString();
    transformedData.total_gastos_imprevistos = formatCurrency(total_gastos_imprevistos);
    
    // 5. VALORES POR DEFECTO PARA CAMPOS CRÍTICOS
    if (!transformedData.fondo_comun_porcentaje) transformedData.fondo_comun_porcentaje = '30';
    if (!transformedData.facultadad_instituto_porcentaje) transformedData.facultadad_instituto_porcentaje = '5';
    if (!transformedData.escuela_departamento_porcentaje) transformedData.escuela_departamento_porcentaje = '0';
    if (!transformedData['imprevistos_3%']) transformedData['imprevistos_3%'] = '3';
    
    // 6. PROCESAR GASTOS
    if (Array.isArray(formData.gastos) && formData.gastos.length > 0) {
      console.log(`Procesando ${formData.gastos.length} gastos`);
      
      formData.gastos.forEach(gasto => {
        if (!gasto.id_conceptos) return;
        
        // La plantilla usa formato con coma (1,1)
        const idConComa = gasto.id_conceptos.replace(/\./g, ',');
        
        // Actualizar los valores en el formato que espera la plantilla
        const cantidad = parseFloat(gasto.cantidad) || 0;
        const valorUnit = parseFloat(gasto.valor_unit) || 0;
        const valorTotal = parseFloat(gasto.valor_total) || cantidad * valorUnit;

        // Asegurarnos de que los valores sean correctos
        console.log(`🔍 Gasto procesado: ID=${idConComa}, Cantidad=${cantidad}, Valor Unitario=${valorUnit}, Valor Total=${valorTotal}`);

        // Asignar valores al objeto transformedData
        transformedData[`gasto_${idConComa}_cantidad`] = cantidad.toString();
        transformedData[`gasto_${idConComa}_valor_unit`] = valorUnit.toString(); // Valor numérico puro
        transformedData[`gasto_${idConComa}_valor_unit_formatted`] = formatCurrency(valorUnit); // Valor formateado
        transformedData[`gasto_${idConComa}_valor_total`] = valorTotal.toString(); // Valor numérico puro
        transformedData[`gasto_${idConComa}_valor_total_formatted`] = formatCurrency(valorTotal); // Valor formateado
      });
    }
    
    // 7. LIMPIEZA FINAL - eliminar placeholders no reemplazados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        transformedData[key] = '';
      }
    });
     
    return transformedData;
  },
  
  sheetsConfig: {
    sheetName: 'Formulario2',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social - Presupuesto',
  watermark: false
};
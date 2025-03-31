/**
 * Configuración específica para el reporte del Formulario 1 - Aprobación
 * Implementación optimizada para marcado directo en Google Sheets y manejo de placeholders
 */
export const report1Config = {
  title: 'Formulario de Aprobación - F-05-MP-05-01-01',
  showHeader: true,
  
  // Función mejorada para transformar los datos para Google Sheets
  transformData: (formData) => {
    // Primero, crear un objeto nuevo vacío
    const transformedData = {};
    
    // IMPORTANTE: Pre-inicializar TODOS los posibles campos que podrían existir en la plantilla
    // Lista completa de marcadores de posición que podrían existir en la plantilla
    const allPossibleFields = [
      // Datos generales
      'nombre_actividad', 'tipo_curso', 'tipo_congreso', 'tipo_conferencia', 'tipo_simposio', 
      'tipo_taller', 'tipo_seminario', 'tipo_diplomado', 'tipo_otro', 'tipo_otro_cual',
      
      // Modalidad
      'modalidad_presencial', 'modalidad_semipresencial', 'modalidad_virtual', 
      'modalidad_mixta', 'modalidad_todas',
      
      // Periodicidad
      'periodicidad_anual', 'periodicidad_semestral', 'periodicidad_permanente',
      
      // Organización
      'organizacion_ofi_ext', 'organizacion_unidad_acad', 'organizacion_otro',
      'organizacion_otro_cual',
      
      // Solidaria
      'extension_solidaria_si', 'extension_solidaria_no', 'costo_extension_solidaria',
      
      // Certificado
      'certificado_solicitado_si', 'certificado_solicitado_no', 'razon_no_certificado_texto',
      
      // Becas
      'becas_convenio', 'becas_estudiantes', 'becas_docentes', 'becas_egresados',
      'becas_funcionarios', 'becas_otros', 'becas_total',
      'becas_convenio_check', 'becas_estudiantes_check', 'becas_docentes_check',
      'becas_egresados_check', 'becas_funcionarios_check', 'becas_otros_check',
      
      // Otros campos específicos del formulario 1
      'fecha_formateada', 'total_horas', 'nombre_responsable', 'email_responsable',
      'telefono_responsable', 'dependencia', 'facultad', 'programa',
      'valor_economico', 'inversion_total',
      
      // Campos adicionales para formulario 4
      'modalidadPresencial_check', 'modalidadVirtual_check', 'modalidadSemipresencial_check',
      
      // Campos específicos para evitar problemas de marcadores 
      'fecha_inicio', 'fecha_fin', 'horas_trabajo_presencial', 'horas_sincronicas',
      'nombre_director', 'cargo_director', 'nombre_coordinador', 'cargo_coordinador'
    ];
    
    // Inicializar todos los campos posibles con cadena vacía
    allPossibleFields.forEach(field => {
      transformedData[field] = '';
    });
    
    // Ahora, copiar todos los datos originales del formulario
    Object.keys(formData).forEach(key => {
      // Si el campo existe en formData, usar ese valor
      if (formData[key] !== undefined && formData[key] !== null) {
        transformedData[key] = formData[key];
      }
    });
    
    console.log("🔄 Transformando datos para Google Sheets - Formulario 1:", formData);
    
    // DEBUGGING: Imprimir valores específicos de interés
    console.log("📊 Valor de periodicidad_oferta:", formData.periodicidad_oferta);
    console.log("📊 Valor de organizacion_actividad:", formData.organizacion_actividad);
    
    // ----- TIPO DE ACTIVIDAD -----
    // Inicializar TODOS los campos de tipo explícitamente con cadena vacía
    transformedData.tipo_curso = '';
    transformedData.tipo_congreso = '';
    transformedData.tipo_conferencia = '';
    transformedData.tipo_simposio = '';
    transformedData.tipo_taller = '';
    transformedData.tipo_seminario = '';
    transformedData.tipo_diplomado = '';
    transformedData.tipo_otro = '';
    transformedData.tipo_otro_cual = '';

    // Marcar con X según el valor seleccionado
    if (formData.tipo === 'Curso') transformedData.tipo_curso = 'X';
    else if (formData.tipo === 'Congreso') transformedData.tipo_congreso = 'X';
    else if (formData.tipo === 'Conferencia') transformedData.tipo_conferencia = 'X';
    else if (formData.tipo === 'Simposio') transformedData.tipo_simposio = 'X';
    else if (formData.tipo === 'Taller') transformedData.tipo_taller = 'X';
    else if (formData.tipo === 'Seminario') transformedData.tipo_seminario = 'X';
    else if (formData.tipo === 'Diplomado') transformedData.tipo_diplomado = 'X';
    else if (formData.tipo === 'Otro') {
      transformedData.tipo_otro = 'X';  // Esta línea es crucial para marcar "Otro"
      transformedData.tipo_otro_cual = formData.otro_tipo || '';
    }
    
    // ----- MODALIDAD -----
    // Inicializar TODOS los campos de modalidad explícitamente
    transformedData.modalidad_presencial = '';
    transformedData.modalidad_semipresencial = '';
    transformedData.modalidad_virtual = '';
    transformedData.modalidad_mixta = '';
    transformedData.modalidad_todas = '';

    // Mapear valores del frontend a los nombres esperados por el backend
    if (formData.modalidad === 'Presencial') transformedData.modalidad_presencial = 'X';
    else if (formData.modalidad === 'Semipresencial') transformedData.modalidad_semipresencial = 'X';
    else if (formData.modalidad === 'Virtual') transformedData.modalidad_virtual = 'X';
    else if (formData.modalidad === 'Mixta') transformedData.modalidad_mixta = 'X';
    else if (formData.modalidad === 'Todas') transformedData.modalidad_todas = 'X';
    
    // ----- PERIODICIDAD -----
    // Añadir justo antes de procesar los campos de periodicidad

    // CORRECTOR DE VALORES POTENCIALMENTE DESPLAZADOS
    console.log("🔍 DIAGNÓSTICO DE VALORES RECIBIDOS:");
    console.log(`- periodicidad_oferta: "${formData.periodicidad_oferta}"`);
    console.log(`- organizacion_actividad: "${formData.organizacion_actividad}"`);
    console.log(`- extension_solidaria: "${formData.extension_solidaria}"`);

    // Detectar y corregir valores desplazados
    if (formData.periodicidad_oferta === 'ofi_ext' || 
        formData.periodicidad_oferta === 'unidad_acad' || 
        formData.periodicidad_oferta === 'otro_act') {
        
        console.log("⚠️ CORRECCIÓN: Detectado desplazamiento de valores");
        
        // Guardar valores originales
        const periodoOriginal = formData.periodicidad_oferta;
        const organizacionOriginal = formData.organizacion_actividad;
        
        // Forzar los valores correctos basados en el patrón observado
        formData.organizacion_actividad = periodoOriginal; // mover valor de periodicidad a organización
        
        // Intentar determinar el valor correcto de periodicidad
        if (formData.organizacion_actividad === 'no' || formData.organizacion_actividad === 'si') {
            formData.extension_solidaria = organizacionOriginal;
            formData.periodicidad_oferta = 'anual'; // valor predeterminado seguro
        } else {
            formData.periodicidad_oferta = 'anual'; // valor predeterminado seguro
        }
        
        console.log("✅ VALORES CORREGIDOS:");
        console.log(`- periodicidad_oferta: "${formData.periodicidad_oferta}"`);
        console.log(`- organizacion_actividad: "${formData.organizacion_actividad}"`);
        console.log(`- extension_solidaria: "${formData.extension_solidaria}"`);
    }

    // CORRECCIÓN DIRECTA PARA CAMPOS ESPECÍFICOS
    // Si el valor de periodicidad es evidentemente incorrecto, usar un valor predeterminado
    if (!['anual', 'semestral', 'permanente'].includes(formData.periodicidad_oferta?.toLowerCase())) {
        console.log(`⚠️ Valor de periodicidad incorrecto: "${formData.periodicidad_oferta}". Usando valor predeterminado "anual"`);
        formData.periodicidad_oferta = 'anual';
    }

    // Si el valor de organización es evidentemente incorrecto, usar un valor predeterminado
    if (!['ofi_ext', 'unidad_acad', 'otro_act'].includes(formData.organizacion_actividad)) {
        console.log(`⚠️ Valor de organización incorrecto: "${formData.organizacion_actividad}". Usando valor predeterminado "ofi_ext"`);
        formData.organizacion_actividad = 'ofi_ext';
    }

    // Si el valor de extensión solidaria es evidentemente incorrecto, usar un valor predeterminado
    if (!['si', 'no'].includes(formData.extension_solidaria?.toLowerCase())) {
        console.log(`⚠️ Valor de extensión solidaria incorrecto: "${formData.extension_solidaria}". Usando valor predeterminado "no"`);
        formData.extension_solidaria = 'no';
    }

    // Asegurarnos de que el valor esté en minúsculas para comparar consistentemente
    const periodoValue = (formData.periodicidad_oferta || '').toLowerCase();
    console.log(`🔍 Procesando periodicidad_oferta: "${periodoValue}" (original: "${formData.periodicidad_oferta}")`);

    // Inicializar todos los campos de periodicidad explícitamente
    transformedData.periodicidad_anual = '';
    transformedData.periodicidad_semestral = '';
    transformedData.periodicidad_permanente = '';

    // Usar valores en minúsculas para comparación consistente
    if (periodoValue === 'anual') {
      console.log("✅ Marcando periodicidad_anual");
      transformedData.periodicidad_anual = 'X';
    } else if (periodoValue === 'semestral') {
      console.log("✅ Marcando periodicidad_semestral");
      transformedData.periodicidad_semestral = 'X';
    } else if (periodoValue === 'permanente') {
      console.log("✅ Marcando periodicidad_permanente");
      transformedData.periodicidad_permanente = 'X';
    } else {
      console.log("⚠️ Valor de periodicidad_oferta no reconocido!");
    }

    
    // ----- ORGANIZACIÓN ACTIVIDAD -----
    const organizacionValue = formData.organizacion_actividad || '';
    console.log(`🔍 Procesando organizacion_actividad: "${organizacionValue}"`);
    
    if (organizacionValue === 'ofi_ext') {
      console.log("✅ Marcando organizacion_ofi_ext");
      transformedData.organizacion_ofi_ext = 'X';
    } else if (organizacionValue === 'unidad_acad') {
      console.log("✅ Marcando organizacion_unidad_acad");
      transformedData.organizacion_unidad_acad = 'X';
    } else if (organizacionValue === 'otro_act') {
      console.log("✅ Marcando organizacion_otro");
      transformedData.organizacion_otro = 'X';
      transformedData.organizacion_otro_cual = formData.otro_tipo_act || '';
      console.log(`  Valor de otro_tipo_act: "${formData.otro_tipo_act}"`);
    } else {
      console.log("⚠️ Valor de organizacion_actividad no reconocido!");
    }
    
    // ----- EXTENSIÓN SOLIDARIA -----
    if (formData.extension_solidaria === 'si') transformedData.extension_solidaria_si = 'X';
    else if (formData.extension_solidaria === 'no') transformedData.extension_solidaria_no = 'X';
    
    // Asegurarse de que el costo_extension_solidaria se procese correctamente
    if ((formData.extension_solidaria || '').toLowerCase() === 'si') {
      // Convertir a número si es posible y formatear como moneda
      const costo = parseInt(formData.costo_extension_solidaria || 0);
      if (!isNaN(costo)) {
        transformedData.costo_extension_solidaria = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(costo);
      } else {
        transformedData.costo_extension_solidaria = formData.costo_extension_solidaria || '';
      }
    } else {
      transformedData.costo_extension_solidaria = 'No aplica';
    }

    // ----- CERTIFICADO SOLICITADO -----
    // Inicializar todos los campos relacionados con certificados con cadena vacía
    transformedData.certificado_asistencia = '';
    transformedData.certificado_aprobacion = '';
    transformedData.certificado_no_otorga = '';
    transformedData.porcentaje_asistencia_minima = '';
    transformedData.metodo_control_asistencia = '';
    transformedData.calificacion_minima = '';
    transformedData.escala_calificacion = '';
    transformedData.metodo_evaluacion = '';
    transformedData.registro_calificacion_participante = '';
    transformedData.razon_no_certificado_texto = '';

    // Marcar con X según el valor seleccionado y añadir información adicional
    if (formData.certificado_solicitado === 'De asistencia') {
      transformedData.certificado_asistencia = 'X';
      transformedData.porcentaje_asistencia_minima = formData.porcentaje_asistencia_minima || '';
      transformedData.metodo_control_asistencia = formData.metodo_control_asistencia || '';
      transformedData.registro_calificacion_participante = formData.registro_calificacion_participante || '';
    } 
    else if (formData.certificado_solicitado === 'De aprobación') {
      transformedData.certificado_aprobacion = 'X';
      transformedData.calificacion_minima = formData.calificacion_minima || '';
      transformedData.escala_calificacion = formData.escala_calificacion || '';
      transformedData.metodo_evaluacion = formData.metodo_evaluacion || '';
      transformedData.registro_calificacion_participante = formData.registro_calificacion_participante || '';
    } 
    else if (formData.certificado_solicitado === 'No otorga certificado') {
      transformedData.certificado_no_otorga = 'X';
      transformedData.razon_no_certificado_texto = formData.razon_no_certificado || '';
    }
    
    // ----- BECAS (CHECKBOXES) -----
    // Determinar si cada beca está marcada basada en el valor numérico
    if (parseInt(formData.becas_convenio) > 0) transformedData.becas_convenio_check = 'X';
    if (parseInt(formData.becas_estudiantes) > 0) transformedData.becas_estudiantes_check = 'X';
    if (parseInt(formData.becas_docentes) > 0) transformedData.becas_docentes_check = 'X';
    if (parseInt(formData.becas_egresados) > 0) transformedData.becas_egresados_check = 'X';
    if (parseInt(formData.becas_funcionarios) > 0) transformedData.becas_funcionarios_check = 'X';
    if (parseInt(formData.becas_otros) > 0) transformedData.becas_otros_check = 'X';
    
    // Mantener valores numéricos originales
    transformedData.becas_convenio = formData.becas_convenio || '0';
    transformedData.becas_estudiantes = formData.becas_estudiantes || '0';
    transformedData.becas_docentes = formData.becas_docentes || '0';
    transformedData.becas_egresados = formData.becas_egresados || '0';
    transformedData.becas_funcionarios = formData.becas_funcionarios || '0';
    transformedData.becas_otros = formData.becas_otros || '0';
    
    // Calcular total de becas
    const totalBecas = 
      parseInt(formData.becas_convenio || 0) +
      parseInt(formData.becas_estudiantes || 0) +
      parseInt(formData.becas_docentes || 0) +
      parseInt(formData.becas_egresados || 0) +
      parseInt(formData.becas_funcionarios || 0) +
      parseInt(formData.becas_otros || 0);
    
    transformedData.becas_total = totalBecas.toString();
    
    // ----- CAMPOS ADICIONALES PARA FORMULARIO 4 -----
    if (formData.modalidadPresencial) transformedData.modalidadPresencial_check = 'X';
    if (formData.modalidadVirtual) transformedData.modalidadVirtual_check = 'X';
    if (formData.modalidadSemipresencial) transformedData.modalidadSemipresencial_check = 'X';
    
    // 3. Cálculos adicionales
    if (formData.horas_trabajo_presencial || formData.horas_sincronicas) {
      const horasPresenciales = parseFloat(formData.horas_trabajo_presencial) || 0;
      const horasSincronicas = parseFloat(formData.horas_sincronicas) || 0;
      transformedData.total_horas = (horasPresenciales + horasSincronicas).toString();
    }
    
    // 4. Formato para fechas
    if (formData.fecha_solicitud) {
      const date = new Date(formData.fecha_solicitud);
      if (!isNaN(date.getTime())) {
        transformedData.fecha_formateada = 
          `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
    }
    
    // IMPORTANTE: Último paso - ELIMINAR valores que podrían contener marcadores de posición no deseados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        console.log(`⚠️ Detectado posible marcador sin reemplazar en campo ${key}: "${value}"`);
        transformedData[key] = ''; // Convertir a cadena vacía
      }
    });

    // Añadir este bloque de limpieza justo antes de devolver transformedData:

    // SEGURIDAD ADICIONAL: Escaneado específico para campos críticos que deben tener valor
    const camposCriticos = [
      // Certificados
      'certificado_asistencia', 'certificado_aprobacion', 'certificado_no_otorga',
      
      // Periodicidad
      'periodicidad_anual', 'periodicidad_semestral', 'periodicidad_permanente',
      
      // Organización
      'organizacion_ofi_ext', 'organizacion_unidad_acad', 'organizacion_otro',
      
      // Modalidad
      'modalidad_presencial', 'modalidad_semipresencial', 'modalidad_virtual', 
      'modalidad_mixta', 'modalidad_todas'
    ];

    // Verifica si hay algún placeholder sin reemplazar en algún campo crítico
    camposCriticos.forEach(campo => {
      if (typeof transformedData[campo] === 'string' && 
          (transformedData[campo].includes('{{') || transformedData[campo].includes('}}') || !transformedData[campo])) {
        console.log(`⚠️ CORRECCIÓN: Campo crítico '${campo}' tiene valor problemático: "${transformedData[campo]}"`);
        transformedData[campo] = ''; // Asegurarse que esté vacío, no null o undefined
      }
    });

    // IMPORTANTE: Volver a verificar los valores para asegurar que las marcas X estén correctas
    // Certificados
    if (formData.certificado_solicitado === 'De asistencia') transformedData.certificado_asistencia = 'X';
    else if (formData.certificado_solicitado === 'De aprobación') transformedData.certificado_aprobacion = 'X';
    else if (formData.certificado_solicitado === 'No otorga certificado') transformedData.certificado_no_otorga = 'X';

    // Periodicidad - verificar otra vez para total seguridad (usando valores en minúsculas)
    if ((formData.periodicidad_oferta || '').toLowerCase() === 'anual') transformedData.periodicidad_anual = 'X';
    else if ((formData.periodicidad_oferta || '').toLowerCase() === 'semestral') transformedData.periodicidad_semestral = 'X';
    else if ((formData.periodicidad_oferta || '').toLowerCase() === 'permanente') transformedData.periodicidad_permanente = 'X';

    // Organización - verificar otra vez
    if (formData.organizacion_actividad === 'ofi_ext') transformedData.organizacion_ofi_ext = 'X';
    else if (formData.organizacion_actividad === 'unidad_acad') transformedData.organizacion_unidad_acad = 'X';
    else if (formData.organizacion_actividad === 'otro_act') transformedData.organizacion_otro = 'X';

    // Extensión solidaria - verificar otra vez
    if ((formData.extension_solidaria || '').toLowerCase() === 'si') transformedData.extension_solidaria_si = 'X';
    else if ((formData.extension_solidaria || '').toLowerCase() === 'no') transformedData.extension_solidaria_no = 'X';

    // Modalidad - verificar otra vez
    if (formData.modalidad === 'Presencial') transformedData.modalidad_presencial = 'X';
    else if (formData.modalidad === 'Semipresencial') transformedData.modalidad_semipresencial = 'X';
    else if (formData.modalidad === 'Virtual') transformedData.modalidad_virtual = 'X';
    else if (formData.modalidad === 'Mixta') transformedData.modalidad_mixta = 'X';
    else if (formData.modalidad === 'Todas') transformedData.modalidad_todas = 'X';

    // En la función transformData(), justo antes del último console.log:

    // ENFOQUE DE OBJETOS SEPARADOS PARA MAYOR CLARIDAD Y ROBUSTEZ
    // Recreamos los objetos de datos específicos para garantizar coherencia
    const certificadoData = {
      certificado_asistencia: '',
      certificado_aprobacion: '',
      certificado_no_otorga: '',
      porcentaje_asistencia_minima: '',
      metodo_control_asistencia: '',
      calificacion_minima: '',
      escala_calificacion: '',
      metodo_evaluacion: '',
      registro_calificacion_participante: '',
      razon_no_certificado_texto: ''
    };

    // Marcar con X según el valor seleccionado
    const certificadoTipo = formData.certificado_solicitado || '';
    if (certificadoTipo === 'De asistencia') {
      certificadoData.certificado_asistencia = 'X';
      certificadoData.porcentaje_asistencia_minima = formData.porcentaje_asistencia_minima || '';
      certificadoData.metodo_control_asistencia = formData.metodo_control_asistencia || '';
      certificadoData.registro_calificacion_participante = formData.registro_calificacion_participante || '';
    } 
    else if (certificadoTipo === 'De aprobación') {
      certificadoData.certificado_aprobacion = 'X';
      certificadoData.calificacion_minima = formData.calificacion_minima || '';
      certificadoData.escala_calificacion = formData.escala_calificacion || '';
      certificadoData.metodo_evaluacion = formData.metodo_evaluacion || '';
      certificadoData.registro_calificacion_participante = formData.registro_calificacion_participante || '';
    } 
    else if (certificadoTipo === 'No otorga certificado') {
      certificadoData.certificado_no_otorga = 'X';
      certificadoData.razon_no_certificado_texto = formData.razon_no_certificado || '';
    }

    // Procesar extensión solidaria en un objeto separado
    const extensionSolidariaData = {
      extension_solidaria_si: formData.extension_solidaria === 'si' ? 'X' : '',
      extension_solidaria_no: formData.extension_solidaria === 'no' ? 'X' : '',
      costo_extension_solidaria: formData.extension_solidaria === 'si' ? formData.costo_extension_solidaria || '' : ''
    };

    // Actualizar los datos transformados con estos objetos más específicos
    Object.assign(transformedData, certificadoData, extensionSolidariaData);

    // Verificación final para evitar marcadores de plantilla no reemplazados
    const fieldGroups = {
      periodicidad: ['periodicidad_anual', 'periodicidad_semestral', 'periodicidad_permanente'],
      organizacion: ['organizacion_ofi_ext', 'organizacion_unidad_acad', 'organizacion_otro'],
      extension: ['extension_solidaria_si', 'extension_solidaria_no', 'costo_extension_solidaria'],
      certificado: ['certificado_asistencia', 'certificado_aprobacion', 'certificado_no_otorga']
    };

    // Registrar el estado final para depuración
    Object.entries(fieldGroups).forEach(([group, fields]) => {
      console.log(`🔍 Estado final de campos de ${group}:`);
      fields.forEach(field => {
        console.log(`  - ${field}: "${transformedData[field]}"`);
      });
    });

    // Añadir al final del transformData, justo antes de retornar los datos

    // VERIFICACIÓN FINAL CRÍTICA PARA ASEGURAR QUE LOS CAMPOS TENGAN AL MENOS UN VALOR
    const grupoCampos = {
      periodicidad: ['periodicidad_anual', 'periodicidad_semestral', 'periodicidad_permanente'],
      organizacion: ['organizacion_ofi_ext', 'organizacion_unidad_acad', 'organizacion_otro'],
      extension: ['extension_solidaria_si', 'extension_solidaria_no']
    };

    // Para cada grupo, asegurarse de que al menos un campo tenga valor 'X'
    Object.entries(grupoCampos).forEach(([grupo, campos]) => {
      const tieneValorX = campos.some(campo => transformedData[campo] === 'X');
      
      if (!tieneValorX) {
        console.log(`⚠️ CORRECCIÓN FINAL: Ningún campo del grupo ${grupo} tiene valor X`);
        
        // Asignar valor 'X' al primer campo como valor predeterminado seguro
        transformedData[campos[0]] = 'X';
        console.log(`✅ Asignado valor X a ${campos[0]} por defecto`);
      }
    });

    // Verificación final de periodicidad específicamente
    if (transformedData.periodicidad_anual !== 'X' && 
        transformedData.periodicidad_semestral !== 'X' && 
        transformedData.periodicidad_permanente !== 'X') {
      console.log("⚠️ CORRECCIÓN DE EMERGENCIA: Forzando valor X en periodicidad_anual");
      transformedData.periodicidad_anual = 'X';
    }

    // Imprimir datos finales transformados para depuración
    console.log("⭐ DATOS TRANSFORMADOS FINALES:", transformedData);
    return transformedData;
  },
  
  // Configuración adicional específica para Google Sheets
  sheetsConfig: {
    sheetName: 'Formulario1',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social',
  watermark: false
};
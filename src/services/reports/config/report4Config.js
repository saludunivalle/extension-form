/**
 * Configuración específica para el reporte del Formulario 4 - Mercadeo Relacional
 */
export const report4Config = {
  title: 'F-08-MP-05-01-01 - Formulario de Mercadeo Relacional',
  showHeader: true,
  
  transformData: (formData) => {
    console.log("🔄 Transformando datos para reporte 4 (frontend)");
    console.log("- DATOS ORIGINALES:", JSON.stringify(formData, null, 2));
    
    // Crear objeto vacío para resultado
    const transformedData = {};
    
    // 1. PRE-INICIALIZAR TODOS LOS CAMPOS POSIBLES
    // Lista completa de campos básicos
    const camposBasicos = [
      'id_solicitud', 'nombre_actividad', 'fecha_solicitud', 'nombre_solicitante',
      'dia', 'mes', 'anio',
      
      // Paso 1 - Actividades de Mercadeo Relacional
      'descripcionPrograma', 'identificacionNecesidades',
      
      // Paso 2 - Valor Económico de los Programas
      'atributosBasicos', 'atributosDiferenciadores', 'competencia', 'programa',
      'programasSimilares', 'estrategiasCompetencia',
      
      // Paso 3 - Modalidad de Ejecución
      'personasInteresChecked', 'personasInteresadas', 'personasMatriculadasChecked', 'personasMatriculadas',
      'otroInteresChecked', 'otroInteres', 'innovacion', 'solicitudExterno', 'interesSondeo',
      'otroMercadeoChecked', 'otroMercadeo', 'llamadas', 'encuestas', 'webinar', 'pautas_redes',
      'otroEstrategiasChecked', 'otroEstrategias', 'preregistroFisico', 'preregistroGoogle',
      'preregistroOtroChecked', 'preregistroOtro', 'preregistro', 'observaciones',
      
      // Paso 4 - Beneficios Ofrecidos
      'gremios', 'sectores_empresariales', 'politicas_publicas', 'otros_mesas_trabajoChecked', 'otros_mesas_trabajo',
      'focusGroup', 'desayunosTrabajo', 'almuerzosTrabajo', 'openHouse', 'ferias_colegios', 'ferias_empresarial',
      'otros_mercadeoChecked', 'otros_mercadeo', 'valorEconomico', 'modalidadPresencial', 'modalidadVirtual',
      'modalidadSemipresencial', 'traslados_docente', 'modalidad_asistida_tecnologia',
      
      // Paso 5 - DOFA del Programa
      'beneficiosTangibles', 'beneficiosIntangibles',
      
      // Modalidad del programa (nuevos campos)
      'particulares', 'colegios', 'empresas', 'egresados', 'colaboradores',
      'otros_publicos_potencialesChecked', 'otros_publicos_potenciales',
      
      // Tendencias
      'tendenciasActuales',
      
      // DOFA (nuevos campos)
      'dofaDebilidades', 'dofaOportunidades', 'dofaFortalezas', 'dofaAmenazas',
      
      // Canales de divulgación (nuevos campos)
      'paginaWeb', 'facebook', 'instagram', 'linkedin', 'correo', 'prensa', 'boletin',
      'llamadas_redes', 'otro_canalChecked', 'otro_canal'
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
    
    // 4. CONVERTIR CAMPOS DE CHECKBOX A FORMATO "Sí/No"
    const camposCheckbox = [
      // Paso 3
      'personasInteresChecked', 'personasMatriculadasChecked', 'otroInteresChecked', 'otroMercadeoChecked',
      'otroEstrategiasChecked', 'preregistroFisico', 'preregistroGoogle', 'preregistroOtroChecked',
      
      // Paso 4
      'otros_mesas_trabajoChecked', 'otros_mercadeoChecked',
      
      // Paso 5 - Modalidad del programa
      'particulares', 'colegios', 'empresas', 'egresados', 'colaboradores', 'otros_publicos_potencialesChecked',
      
      // Paso 5 - Canales de divulgación
      'paginaWeb', 'facebook', 'instagram', 'linkedin', 'correo', 'prensa', 'boletin',
      'llamadas_redes', 'otro_canalChecked'
    ];
      
    camposCheckbox.forEach(campo => {
      const valor = transformedData[campo];
      // Convertir a formato "Sí/No"
      const esAfirmativo = 
        valor === true || 
        valor === 'Sí' || 
        valor === 'Si' ||
        (typeof valor === 'string' && ['sí', 'si', 's', 'yes', 'y', 'true'].includes(valor.toString().toLowerCase()));
    
      transformedData[campo] = esAfirmativo ? 'Sí' : 'No';
    });

    // 5. FORMATEAR CAMPOS ESPECIALES DE PREREGISTRO
    // Crear campo consolidado de preregistro
    const preregistroOpciones = [];
    if (transformedData.preregistroFisico === 'Sí') preregistroOpciones.push('Físico');
    if (transformedData.preregistroGoogle === 'Sí') preregistroOpciones.push('Google');
    if (transformedData.preregistroOtroChecked === 'Sí' && transformedData.preregistroOtro) {
      preregistroOpciones.push(transformedData.preregistroOtro);
    }
    transformedData.preregistro = preregistroOpciones.length > 0 ? preregistroOpciones.join(', ') : 'No';

    // 6. FORMATEAR CAMPOS DE TEXTO CONDICIONALES
    // Manejar campos "otros" que dependen de checkboxes
    const camposCondicionales = [
      { checkbox: 'otroInteresChecked', campo: 'otroInteres' },
      { checkbox: 'otroMercadeoChecked', campo: 'otroMercadeo' },
      { checkbox: 'otroEstrategiasChecked', campo: 'otroEstrategias' },
      { checkbox: 'otros_mesas_trabajoChecked', campo: 'otros_mesas_trabajo' },
      { checkbox: 'otros_mercadeoChecked', campo: 'otros_mercadeo' },
      { checkbox: 'otros_publicos_potencialesChecked', campo: 'otros_publicos_potenciales' },
      { checkbox: 'otro_canalChecked', campo: 'otro_canal' }
    ];

    camposCondicionales.forEach(({ checkbox, campo }) => {
      const tieneValor = typeof transformedData[campo] === 'string' && transformedData[campo].trim() !== '';
      if (tieneValor) {
        // Respetar el texto si existe y asegurar que el checkbox quede como 'Sí'
        transformedData[checkbox] = 'Sí';
      } else if (transformedData[checkbox] !== 'Sí') {
        transformedData[campo] = 'No';
      } else if (!transformedData[campo] || transformedData[campo].trim() === '') {
        transformedData[campo] = 'Valor especificado';
      }
    });
      
    // 7. VALORES POR DEFECTO PARA CAMPOS CRÍTICOS
    if (!transformedData.descripcionPrograma) transformedData.descripcionPrograma = 'No especificado';
    if (!transformedData.identificacionNecesidades) transformedData.identificacionNecesidades = 'No especificado';
    if (!transformedData.beneficiosTangibles) transformedData.beneficiosTangibles = 'No especificado';
    if (!transformedData.beneficiosIntangibles) transformedData.beneficiosIntangibles = 'No especificado';
    if (!transformedData.tendenciasActuales) transformedData.tendenciasActuales = 'No especificado';
      
    // 8. LIMPIEZA FINAL - eliminar placeholders no reemplazados
    Object.keys(transformedData).forEach(key => {
      const value = transformedData[key];
      if (typeof value === 'string' && (value.includes('{{') || value.includes('}}'))) {
        transformedData[key] = '';
      }
    });
       
    console.log("✅ DATOS TRANSFORMADOS PARA REPORTE 4:", transformedData);
    return transformedData;
  },
    
  sheetsConfig: {
    sheetName: 'Formulario4',
    dataRange: 'A1:Z100'
  },
  footerText: 'Universidad del Valle - Extensión y Proyección Social - Mercadeo Relacional',
  watermark: false
};
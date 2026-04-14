import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, useMediaQuery, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Alert } from '@mui/material';
import FormSection from '../components/FormSection/FormSection';
import FormSection2 from '../components/FormSection2/FormSection2';
import FormSection3 from '../components/FormSection3/FormSection3';
import FormSection4 from '../components/FormSection4/FormSection4';
import FormStepper from './FormStepper';
import useFormNavigation from '../hooks/useFormNavigation';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { config } from '../config';
const API_URL = config.API_URL;
const sectionTitles = [
  'Aprobación - Formulario F-05-MP-05-01-01',
  'Presupuesto - Formulario F-06-MP-05-01-01',
  'Riesgos Potenciales - Formulario F-08-MP-05-01-01',
  'Identificación de Mercadeo - Formulario F-07-MP-05-01-01'
];

const sectionShortTitles = [
  'Aprobación',
  'Presupuesto',
  'Riesgos Potenciales',
  'Identificación de Mercadeo'
];

const flattenSolicitudData = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const rootFields = {};
  const nestedFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(nestedFields, value);
    } else {
      rootFields[key] = value;
    }
  });

  return Object.keys(nestedFields).length > 0 ? { ...rootFields, ...nestedFields } : data;
};

const normalizeYesNo = (value) => {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['sí', 'si', 's', 'yes', 'y', 'true', '1'].includes(normalized)) return 'Sí';
  if (['no', 'n', 'false', '0'].includes(normalized)) return 'No';
  return value;
};

const hasUsefulText = (value) => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== '' && normalized !== 'no';
};

const normalizePeriodicidadOferta = (value) => {
  if (value === undefined || value === null) return value;
  const normalized = String(value).trim().toLowerCase();

  const map = {
    anual: 'anual',
    semestral: 'semestral',
    permanente: 'permanente',
    'solo una vez': 'solo una vez',
    'solo_una_vez': 'solo una vez',
  };

  return map[normalized] || value;
};

const normalizeOrganizacionActividad = (value) => {
  if (value === undefined || value === null) return value;
  const normalized = String(value).trim().toLowerCase();

  const map = {
    ofi_ext: 'ofi_ext',
    'oficina de extension': 'ofi_ext',
    'oficina de extensión': 'ofi_ext',
    unidad_acad: 'unidad_acad',
    'unidad academica': 'unidad_acad',
    'unidad académica': 'unidad_acad',
    otro_act: 'otro_act',
    otro: 'otro_act',
  };

  return map[normalized] || value;
};

const normalizeTipoValor = (value) => {
  if (value === undefined || value === null) return value;
  const normalized = String(value).trim().toLowerCase();

  if (['valor_unitario', 'valor unitario', 'smmlv'].includes(normalized)) {
    return 'valor_unitario';
  }

  if (['cifra_pesos', 'cifra en pesos', 'pesos', 'valor_inscripcion'].includes(normalized)) {
    return 'cifra_pesos';
  }

  return value;
};

const normalizeSiNoLower = (value) => {
  if (value === undefined || value === null) return value;
  const normalized = String(value).trim().toLowerCase();
  if (['si', 'sí', 's', 'true', '1', 'yes'].includes(normalized)) return 'si';
  if (['no', 'n', 'false', '0'].includes(normalized)) return 'no';
  return value;
};

const normalizeLoadedSolicitudData = (rawData) => {
  const data = { ...flattenSolicitudData(rawData) };

  const yesNoFields = [
    'personasInteresChecked',
    'personasMatriculadasChecked',
    'innovacion',
    'solicitudExterno',
    'interesSondeo',
    'llamadas',
    'encuestas',
    'webinar',
    'pautas_redes',
    'preregistroFisico',
    'preregistroGoogle',
    'gremios',
    'sectores_empresariales',
    'politicas_publicas',
    'focusGroup',
    'desayunosTrabajo',
    'almuerzosTrabajo',
    'openHouse',
    'ferias_colegios',
    'ferias_empresarial',
    'modalidadPresencial',
    'modalidadVirtual',
    'modalidadSemipresencial',
    'traslados_docente',
    'modalidad_asistida_tecnologia',
    'particulares',
    'colegios',
    'empresas',
    'egresados',
    'colaboradores',
    'paginaWeb',
    'facebook',
    'instagram',
    'linkedin',
    'correo',
    'prensa',
    'boletin',
    'llamadas_redes'
  ];

  yesNoFields.forEach((field) => {
    if (data[field] !== undefined) {
      data[field] = normalizeYesNo(data[field]);
    }
  });

  const conditionalFields = [
    { check: 'otroInteresChecked', text: 'otroInteres' },
    { check: 'otroMercadeoChecked', text: 'otroMercadeo' },
    { check: 'otroEstrategiasChecked', text: 'otroEstrategias' },
    { check: 'preregistroOtroChecked', text: 'preregistroOtro' },
    { check: 'otros_mesas_trabajoChecked', text: 'otros_mesas_trabajo' },
    { check: 'otros_mercadeoChecked', text: 'otros_mercadeo' },
    { check: 'otros_publicos_potencialesChecked', text: 'otros_publicos_potenciales' },
    { check: 'otro_canalChecked', text: 'otro_canal' }
  ];

  conditionalFields.forEach(({ check, text }) => {
    const normalizedCheck = normalizeYesNo(data[check]);
    const shouldBeChecked = hasUsefulText(data[text]) || normalizedCheck === 'Sí';
    data[check] = shouldBeChecked ? 'Sí' : 'No';
  });

  if (!data.preregistroFisico && !data.preregistroGoogle && !hasUsefulText(data.preregistroOtro) && typeof data.preregistro === 'string') {
    const preregistro = data.preregistro.toLowerCase();
    if (preregistro.includes('físico') || preregistro.includes('fisico')) {
      data.preregistroFisico = 'Sí';
    }
    if (preregistro.includes('google')) {
      data.preregistroGoogle = 'Sí';
    }
  }

  // Compatibilidad con typo historico del backend/sheet
  if ((data.imprevistos_porcentaje === undefined || data.imprevistos_porcentaje === null || data.imprevistos_porcentaje === '')
    && data.imprevistos_procentaje !== undefined) {
    data.imprevistos_porcentaje = data.imprevistos_procentaje;
  }

  if (data.periodicidad_oferta !== undefined) {
    data.periodicidad_oferta = normalizePeriodicidadOferta(data.periodicidad_oferta);
  }

  if (data.organizacion_actividad !== undefined) {
    data.organizacion_actividad = normalizeOrganizacionActividad(data.organizacion_actividad);
  }

  if (data.extension_solidaria !== undefined) {
    data.extension_solidaria = normalizeSiNoLower(data.extension_solidaria);
  }

  // Regla de negocio: porcentaje de facultad/instituto fijo en 5.
  data.facultad_instituto_porcentaje = 5;

  if (data.tipo_valor !== undefined) {
    data.tipo_valor = normalizeTipoValor(data.tipo_valor);
  }

  if (typeof data.valor_unitario === 'string') {
    const parsedValorUnitario = parseFloat(data.valor_unitario.replace(',', '.'));
    if (Number.isFinite(parsedValorUnitario)) {
      data.valor_unitario = parsedValorUnitario;
    }
  }

  if (typeof data.costo_extension_solidaria === 'string') {
    const parsedCosto = parseFloat(data.costo_extension_solidaria.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsedCosto)) {
      data.costo_extension_solidaria = parsedCosto;
    }
  }

  if (!data.tipo_valor && Number(data.valor_inscripcion) > 0) {
    data.tipo_valor = 'cifra_pesos';
  }

  if (typeof data.valor_inscripcion === 'string') {
    const parsedInscripcion = parseInt(data.valor_inscripcion.replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(parsedInscripcion)) {
      data.valor_inscripcion = parsedInscripcion;
    }
  }

  if (data.extension_solidaria === 'si') {
    data.ingresos_cantidad = 0;
    data.ingresos_vr_unit = 0;

    if (!String(data.observaciones || '').trim()) {
      data.observaciones = 'Actividad de extension solidaria sin recaudo por inscripcion.';
    }
  }

  // Compatibilidad de horas PAT: en registros viejos suele venir solo en horas_sincronicas.
  if (data.modalidad === 'Presencial asistida por tecnología' && !data.horas_trabajo_pat && data.horas_sincronicas) {
    data.horas_trabajo_pat = data.horas_sincronicas;
  }

  if ((!data.total_horas || Number(data.total_horas) === 0) && data.modalidad) {
    const horasPresencial = Number(data.horas_trabajo_presencial || 0);
    const horasSync = Number(data.horas_sincronicas || 0);
    const horasPat = Number(data.horas_trabajo_pat || data.horas_sincronicas || 0);

    if (data.modalidad === 'Presencial') data.total_horas = horasPresencial;
    else if (data.modalidad === 'Presencial asistida por tecnología') data.total_horas = horasPat;
    else if (data.modalidad === 'Virtual') data.total_horas = horasSync;
    else if (['Mixta', 'Semipresencial', 'Todas las anteriores'].includes(data.modalidad)) data.total_horas = horasPresencial + horasSync;
  }

  return data;
};

function FormPage({ userData }) {
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readOnly') === '1';
  const [highestSectionReached, setHighestSectionReached] = useState(1);
  const { formId } = useParams(); // Se extrae la sección actual de la URL
  const formStep = searchParams.get('paso') || 0;
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Obtener el id de solicitud exclusivamente de la URL
  const solicitudId = searchParams.get('solicitud');

  // Definir el mapping de totalSteps para cada formulario
  const getTotalSteps = (fid) => {
    const stepsMap = {
      '1': 5, // FormSection tiene 5 pasos
      '2': 3, // FormSection2 tiene 3 pasos
      '3': 5, // FormSection3 tiene 5 pasos
      '4': 5  // FormSection4 tiene 5 pasos (ajustar si es diferente)
    };
    return stepsMap[fid] || 5; // Valor por defecto si no se encuentra
  };

  // Calcular totalSteps basado en el formId actual
  const totalSteps = getTotalSteps(formId);

  // Estados para control de carga
  const [estadoCargando, setEstadoCargando] = useState(false);
  const [etapaActual, setEtapaActual] = useState(1);
  const [pasoActual, setPasoActual] = useState(1);
  const [estadoFormularios, setEstadoFormularios] = useState({});
  const [formularioCompleto, setFormularioCompleto] = useState(false);
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);

  const [formCompletion, setFormCompletion] = useState({
    1: { completed: false, lastStep: 0 },
    2: { completed: false, lastStep: 0 },
    3: { completed: false, lastStep: 0 },
    4: { completed: false, lastStep: 0 }
  });

  const [errors, setErrors] = useState({});
  
  // Función para actualizar el estado de completitud
  const updateFormCompletion = (formId, isCompleted, step) => {
    setFormCompletion(prev => ({
      ...prev,
      [formId]: {
        completed: isCompleted || prev[formId].completed,
        lastStep: Math.max(step, prev[formId].lastStep)
      }
    }));
  };

  // Si no existe id en la URL, se solicita uno nuevo y se redirige a la sección 1, paso 0.
  useEffect(() => {
    if (!solicitudId) {
      // Si no existe id en la URL, obtener un nuevo a través de getLastId
      axios.get(`${API_URL}/getLastId`, {
        params: { sheetName: 'SOLICITUDES2' }
      })
      .then(response => {
        const nuevoId = response.data.lastId + 1;
        localStorage.setItem('id_solicitud', nuevoId);
        
        // Al crear una nueva solicitud, reiniciamos el nivel más alto
        setHighestSectionReached(1);
        localStorage.removeItem(`highestSectionReached_${nuevoId}`);
        
        navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`, { replace: true });
      })
      .catch(error => {
        console.error('Error al obtener un nuevo ID de solicitud:', error);
      });
    } else {
      localStorage.setItem('id_solicitud', solicitudId);
    }
  }, [solicitudId, navigate, userData.id]);

  // Agregar useEffect para cargar el estado global inicial

// En el componente de formulario
useEffect(() => {
  const cargarEstadoGlobal = async () => {
    if (!solicitudId) return;
    
    setEstadoCargando(true);
    
    try {
      const response = await axios.post(`${API_URL}/progreso-actual`, {
        id_solicitud: solicitudId,
        etapa_destino: formId || 1,
        paso_destino: 1,
        id_usuario: userData?.id_usuario,
        name: userData?.name
      });

      if (response.data.success) {
        const { estado } = response.data;
        console.log("📊 Estado de progreso cargado:", estado);
        
        // Actualizar estados locales con la información del servidor
        setEtapaActual(estado.etapaActual);
        setPasoActual(estado.pasoActual);
        setEstadoFormularios(estado.estadoFormularios);
        
        // Determinar si este formulario está completo
        setFormularioCompleto(estado.estadoFormularios[formId] === "Completado");
        
        // Determinar el paso máximo permitido
        let nuevoMaxAllowedStep = 0;
        
        // Si el formulario está completado o es anterior al actual, permitir todos los pasos
        if (estado.estadoFormularios[formId] === "Completado" || formId < estado.etapaActual) {
          nuevoMaxAllowedStep = totalSteps - 1;
        } 
        // Si estamos en el formulario actual, permitir hasta el paso actual
        else if (formId === estado.etapaActual) {
          nuevoMaxAllowedStep = Math.max(0, estado.pasoActual - 1);
        }
        
        setMaxAllowedStep(nuevoMaxAllowedStep);
      } else {
        console.warn('Error controlado:', response.data.error);
        inicializarEstadoLocal();
      }
    } catch (error) {
      console.error('Error al cargar estado global:', error);
      
      // Intentar una vez más con parámetros adicionales para asegurar la creación
      try {
        console.log('Reintentando con datos de usuario adicionales...');
        const retryResponse = await axios.post(`${API_URL}/progreso-actual`, {
          id_solicitud: solicitudId,
          etapa_destino: 1,
          paso_destino: 1,
          id_usuario: userData?.id_usuario || 'usuario_desconocido',
          name: userData?.name || 'Usuario sin nombre'
        });
        
        if (retryResponse.data.success) {
          console.log('✅ Reintento exitoso, cargando estado...');
          cargarEstadoGlobal(); // Reintentar carga completa
        } else {
          inicializarEstadoLocal();
        }
      } catch (retryError) {
        console.error('Error en reintento:', retryError);
        inicializarEstadoLocal();
      }
    } finally {
      setEstadoCargando(false);
    }
  };
  
  // Función para inicializar estado local si falla la carga del servidor
  const inicializarEstadoLocal = () => {
    console.log('Inicializando estado local por fallback...');
    setEtapaActual(1);
    setPasoActual(1);
    setEstadoFormularios({
      "1": "En progreso", 
      "2": "En progreso", 
      "3": "En progreso", 
      "4": "En progreso"
    });
    setFormularioCompleto(false);
    setMaxAllowedStep(0); // Permitir solo el primer paso
  };

  cargarEstadoGlobal();
}, [solicitudId, formId, userData, totalSteps]);

useEffect(() => {
  if (!isReadOnly) {
    return;
  }

  const blockedWritePaths = [
    '/guardarProgreso',
    '/guardarGastos',
    '/guardarForm2Paso3',
    '/createNewRequest',
    '/riesgos',
    '/migrar-riesgos-form3',
    '/form/save',
  ];

  const shouldBlock = (url) => {
    const rawUrl = String(url || '');
    return blockedWritePaths.some((path) => rawUrl.includes(path));
  };

  const mockReadOnlyResponse = {
    data: { success: true, readOnlyBlocked: true },
    status: 200,
    statusText: 'OK',
    headers: {},
  };

  const originalPost = axios.post.bind(axios);
  const originalPut = axios.put.bind(axios);
  const originalPatch = axios.patch.bind(axios);
  const originalDelete = axios.delete.bind(axios);

  axios.post = (url, ...args) => (shouldBlock(url) ? Promise.resolve({ ...mockReadOnlyResponse, config: { url, method: 'post' } }) : originalPost(url, ...args));
  axios.put = (url, ...args) => (shouldBlock(url) ? Promise.resolve({ ...mockReadOnlyResponse, config: { url, method: 'put' } }) : originalPut(url, ...args));
  axios.patch = (url, ...args) => (shouldBlock(url) ? Promise.resolve({ ...mockReadOnlyResponse, config: { url, method: 'patch' } }) : originalPatch(url, ...args));
  axios.delete = (url, ...args) => (shouldBlock(url) ? Promise.resolve({ ...mockReadOnlyResponse, config: { url, method: 'delete' } }) : originalDelete(url, ...args));

  return () => {
    axios.post = originalPost;
    axios.put = originalPut;
    axios.patch = originalPatch;
    axios.delete = originalDelete;
  };
}, [isReadOnly]);

  // formData se inicializa con el id de solicitud obtenido de la URL
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('formData');
    return savedFormData ? JSON.parse(savedFormData) : {
    id_solicitud: solicitudId || '',
    // Resto de campos inicializados según las hojas de la solicitud
    fecha_solicitud: '', nombre_actividad: '', nombre_solicitante: userData?.name || '',
    tipo_programa: '',
    dependencia_tipo: '', nombre_escuela: '', nombre_departamento: '',
    nombre_seccion: '', nombre_dependencia: '', entradas_diseño: '', introduccion: '',
    objetivo_general: '', objetivos_especificos: '', justificacion: '',
    metodologia: '', tipo: '', otro_tipo: '', modalidad: '',
    horas_trabajo_presencial: '', horas_sincronicas: '', total_horas: '',
    programCont: '', dirigidoa: '', creditos: '', cupo_min: '', cupo_max: '',
    profesor_participante: '', nombre_coordinador: '', correo_coordinador: '',
    tel_coordinador: '', perfil_competencia: '', formas_evaluacion: '',
    certificado_solicitado: '', calificacion_minima: '', razon_no_certificado: '',
    tipo_valor: '', valor_unitario: '', valor_inscripcion: '',
    extension_solidaria: '', costo_extension_solidaria: '', pieza_grafica: '', personal_externo: '',
    becas_convenio: '', becas_estudiantes: '',
    becas_docentes: '', becas_egresados: '', becas_funcionarios: '',
    becas_otros: '', becas_total: '', periodicidad_oferta: '', fechas_actividad: '',
    organizacion_actividad: '', otro_tipo_act: '', fecha_por_meses: '',
    fecha_inicio: '', fecha_final: '',
    observaciones_cambios: '',
  // Hoja SOLICITUDES3
    ingresos_cantidad: '', ingresos_vr_unit: '',
    personal_universidad_cantidad: '', personal_universidad_vr_unit: '',
    honorarios_docentes_cantidad: '', honorarios_docentes_vr_unit: '',
    otro_personal_cantidad: '', otro_personal_vr_unit: '',
    escuela_departamento: '',
    total_recursos: '', coordinador_actividad: '', visto_bueno_unidad: '',
    total_ingresos: '', total_costos_personal: '',
    total_personal_universidad: '', total_honorarios_docentes: '',
    total_otro_personal: '', total_materiales_sumi: '',
    total_gastos_alojamiento: '', total_gastos_alimentacion: '',
    total_gastos_transporte: '', total_equipos_alquiler_compra: '',
    total_dotacion_participantes: '', total_carpetas: '', total_libretas: '',
    total_lapiceros: '', total_memorias: '', total_marcadores_papel_otros: '',
    total_impresos: '', total_labels: '', total_certificados: '',
    total_escarapelas: '', total_fotocopias: '', total_estacion_cafe: '',
    total_transporte_mensaje: '', total_refrigerios: '',
    total_infraestructura_fisica: '', total_gastos_generales: '',
    total_infraestructura_universitaria: '', imprevistos: '', imprevistos_porcentaje: '3', imprevistos_procentaje: '', total_aportes_univalle: '',
    fondo_comun_porcentaje: '30', facultad_instituto_porcentaje: '5', escuela_departamento_porcentaje: '0',
    archivo_fondo_comun: '',
    // Hoja SOLICITUDES4
    descripcionPrograma: '', identificacionNecesidades: '', atributosBasicos: '',
    atributosDiferenciadores: '', competencia: '', programa: '',
    programasSimilares: '', estrategiasCompetencia: '', personasInteres: '',
    personasMatriculadas: '', otroInteres: '', innovacion: '',
    solicitudExterno: '', interesSondeo: '', llamadas: '', encuestas: '',
    webinar: '', preregistro: '', mesasTrabajo: '', focusGroup: '',
    desayunosTrabajo: '', almuerzosTrabajo: '', openHouse: '', valorEconomico: '',
    modalidadPresencial: '', modalidadVirtual: '', modalidadSemipresencial: '',
    otraModalidad: '', beneficiosTangibles: '', beneficiosIntangibles: '',
    particulares: '', colegios: '', empresas: '', egresados: '',
    colaboradores: '', otros_publicos_potenciales: '', tendenciasActuales: '',
    dofaDebilidades: '', dofaOportunidades: '', dofaFortalezas: '',
    dofaAmenazas: '', paginaWeb: '', facebook: '', instagram: '',
    linkedin: '', correo: '', prensa: '', boletin: '', llamadas_redes: '',
    otro_canal: '',
    // Hoja SOLICITUDES5
    proposito: '', comentario: '', fecha: '', elaboradoPor: '',
    aplicaDiseno1: '', aplicaDiseno2: '', aplicaDiseno3: '',
    aplicaLocacion1: '', aplicaLocacion2: '', aplicaLocacion3: '',
    aplicaDesarrollo1: '', aplicaDesarrollo2: '', aplicaDesarrollo3: '',
    aplicaDesarrollo4: '', aplicaDesarrollo5: '', aplicaCierre1: '',
    aplicaCierre2: '', aplicaOtros1: '', aplicaOtros2: ''
  }});

  useEffect(() => {
    const hydrateFormData = async () => {
      if (!solicitudId) return;

      try {
        const response = await axios.get(`${API_URL}/getSolicitud`, {
          params: { id_solicitud: solicitudId }
        });

        console.log('📥 getSolicitud raw (campos clave):', {
          id_solicitud: response?.data?.id_solicitud,
          modalidad: response?.data?.modalidad,
          horas_trabajo_presencial: response?.data?.horas_trabajo_presencial,
          horas_trabajo_pat: response?.data?.horas_trabajo_pat,
          horas_sincronicas: response?.data?.horas_sincronicas,
          total_horas: response?.data?.total_horas,
          valor_inscripcion: response?.data?.valor_inscripcion,
          pieza_grafica: response?.data?.pieza_grafica,
          archivo_fondo_comun: response?.data?.archivo_fondo_comun,
        });

        const normalizedData = normalizeLoadedSolicitudData(response.data);
        if (Object.keys(normalizedData).length === 0) return;

        console.log('🧩 getSolicitud normalizado (campos clave):', {
          modalidad: normalizedData?.modalidad,
          horas_trabajo_presencial: normalizedData?.horas_trabajo_presencial,
          horas_trabajo_pat: normalizedData?.horas_trabajo_pat,
          horas_sincronicas: normalizedData?.horas_sincronicas,
          total_horas: normalizedData?.total_horas,
          valor_inscripcion: normalizedData?.valor_inscripcion,
          pieza_grafica: normalizedData?.pieza_grafica,
          archivo_fondo_comun: normalizedData?.archivo_fondo_comun,
        });

        setFormData((prev) => ({
          ...prev,
          ...normalizedData,
          id_solicitud: solicitudId || normalizedData.id_solicitud || prev.id_solicitud,
        }));

        localStorage.setItem('formData', JSON.stringify(normalizedData));
      } catch (error) {
        console.error('Error al hidratar datos de la solicitud:', error);
      }
    };

    hydrateFormData();
  }, [solicitudId]);

  // 1. Añadir un nuevo estado para rastrear formularios accesibles
  const [accessibleForms, setAccessibleForms] = useState(() => {
    const savedForms = localStorage.getItem(`accessible_forms_${solicitudId}`);
    return savedForms ? JSON.parse(savedForms) : [1]; // Formulario 1 siempre accesible por defecto
  });

  const { 
    currentSection,
    setCurrentSection, 
    currentStep, 
    setCurrentStep,
    navigateToSection,
    calculateCompletedSteps,
    clickableSteps
  } = useFormNavigation({
    solicitudId,
    formData,
    initialSection: parseInt(formId, 10) || 1,
    initialStep: parseInt(formStep, 10) || 0,
    totalSections: sectionTitles.length
  });


  // Fetch de datos de escuelas, programas y oficinas desde Google Sheets
  const [escuelas, setEscuelas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getProgramasYOficinas`);
        const data = response.data;
        setEscuelas([...new Set(data.programas.map(item => item.Escuela).filter(Boolean))]);
        setOficinas(data.oficinas);
        setProgramas(data.programas);
      } catch (error) {
        console.error('Error al obtener datos de la hoja de Google Sheets:', error);
      }
    };
    fetchData();
  }, []);

  // Dependencias para departamentos, secciones y programas filtrados
  useEffect(() => {
    if (formData.nombre_escuela) {
      try {
        // Validar que programas sea un array antes de filtrar
        if (!Array.isArray(programas)) {
          console.error("programas no es un array:", programas);
          setDepartamentos([]);
          return;
        }
  
        const departamentosFiltrados = [...new Set(
          programas
            .filter(item => item && item.Escuela === formData.nombre_escuela)
            .map(item => item?.Departamento || "General")
        )];
        
        setDepartamentos(departamentosFiltrados);
      } catch (err) {
        console.error("Error al filtrar departamentos:", err);
        setDepartamentos([]);
      }
    } else {
      setDepartamentos([]);
      setSecciones([]);
      setProgramasFiltrados([]);
    }
  }, [formData.nombre_escuela, programas]);

  useEffect(() => {
    if (formData.nombre_departamento) {
      const seccionesFiltradas = [
        ...new Set(
          programas
            .filter(item =>
              item.Escuela === formData.nombre_escuela &&
              (item.Departamento === formData.nombre_departamento || (!item.Departamento && formData.nombre_departamento === "General"))
            )
            .map(item => item.Sección || "General")
        ),
      ];
      if (seccionesFiltradas.length === 1 && seccionesFiltradas[0] === "General") {
        setFormData(prev => ({ ...prev, nombre_seccion: "General" }));
      }
      setSecciones(seccionesFiltradas);
    } else {
      setSecciones([]);
    }
  }, [formData.nombre_departamento, formData.nombre_escuela, programas]);

  useEffect(() => {
    if (formData.nombre_seccion) {
      const programasRelacionados = programas.filter(
        item =>
          item.Escuela === formData.nombre_escuela &&
          (item.Departamento === formData.nombre_departamento || (!item.Departamento && formData.nombre_departamento === "General")) &&
          (item.Sección === formData.nombre_seccion || (!item.Sección && formData.nombre_seccion === "General"))
      );
      setProgramasFiltrados(programasRelacionados);
    } else {
      setProgramasFiltrados([]);
    }
  }, [formData.nombre_seccion, formData.nombre_departamento, formData.nombre_escuela, programas]);

  // Manejo de cambios en los inputs
  const handleInputChange = (event) => {
    if (isReadOnly) {
      return;
    }

    const { name, value, files } = event.target;
    setFormData(prev => {
      let updated = { ...prev, [name]: files ? files[0] : value };
      
      // Special handling when dependencia_tipo changes
      if (name === 'dependencia_tipo') {
        if (value === 'Oficinas') {
          // Clear school-related fields when switching to Oficinas
          updated = {
            ...updated,
            nombre_escuela: '',
            nombre_departamento: '',
            nombre_seccion: '',
            // nombre_dependencia is kept as it's used for both types
          };
        } else if (value === 'Escuelas') {
          // When switching to Escuelas, clear office-related dependencia
          updated.nombre_dependencia = '';
        }
      }
      // Existing cascade clearing logic
      else if (name === 'nombre_escuela') {
        updated.nombre_departamento = '';
        updated.nombre_seccion = '';
        updated.nombre_dependencia = '';
      }
      else if (name === 'nombre_departamento') {
        updated.nombre_seccion = '';
        updated.nombre_dependencia = '';
      }
      else if (name === 'nombre_seccion') {
        updated.nombre_dependencia = '';
      }
      
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (isReadOnly) {
      return;
    }

    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const validateStep = () => {
    let stepErrors = {};

    if (currentStep === 0) {
      // Validaciones para el paso 1
      if (!formData.nombre_actividad) {
        stepErrors.nombre_actividad = "Este campo es obligatorio";
      }
    } else if (currentStep === 1) {
      // Validaciones para el paso 2
      if (!formData.ingresos_cantidad) {
        stepErrors.ingresos_cantidad = "Este campo es obligatorio";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0; // Retorna true si no hay errores
  };

  // 2. Modificar la función handleSectionChange para verificar la accesibilidad
  const handleSectionChange = async (sectionNumber) => {
    try {
      // 1. CLAVE: Crear un historial permanente de formularios a los que el usuario ha accedido alguna vez
      const historialFormulariosKey = `historial_formularios_${solicitudId}`;
      let historialFormularios = JSON.parse(localStorage.getItem(historialFormulariosKey) || '[]');
      
      // 2. VERIFICAR PRIMERO: Si el formulario está en el historial, permitir acceso inmediato
      if (historialFormularios.includes(sectionNumber)) {
        console.log(`Formulario ${sectionNumber} está en historial, permitiendo acceso directo`);
        // Marcar como accesible para mantener la UI consistente
        const accessibleForms = JSON.parse(localStorage.getItem(`accessible_forms_${solicitudId}`) || '[]');
        if (!accessibleForms.includes(sectionNumber)) {
          accessibleForms.push(sectionNumber);
          localStorage.setItem(`accessible_forms_${solicitudId}`, JSON.stringify(accessibleForms));
          setAccessibleForms(accessibleForms);
        }
        navigateToSection(sectionNumber);
        return;
      }
      
      // Resto del código existente para verificar accesibilidad...
      
      // Verificar acceso con el backend
      const response = await axios.post(`${API_URL}/progreso-actual`, {
        id_solicitud: solicitudId,
        etapa_destino: sectionNumber,
        paso_destino: 1
      });
      
      if (response.data.success && response.data.puedeAvanzar) {
        // 3. IMPORTANTE: Agregar al historial cuando el backend confirma acceso
        if (!historialFormularios.includes(sectionNumber)) {
          historialFormularios.push(sectionNumber);
          localStorage.setItem(historialFormulariosKey, JSON.stringify(historialFormularios));
        }
        
        // Marcar como accesible para la UI
        const accessibleForms = JSON.parse(localStorage.getItem(`accessible_forms_${solicitudId}`) || '[]');
        if (!accessibleForms.includes(sectionNumber)) {
          accessibleForms.push(sectionNumber);
          localStorage.setItem(`accessible_forms_${solicitudId}`, JSON.stringify(accessibleForms));
          setAccessibleForms(accessibleForms);
        }
        
        navigateToSection(sectionNumber);
      } else {
        alert(response.data.mensaje || 'No puede acceder a formularios futuros sin completar los anteriores');
      }
    } catch (error) {
      console.error('Error al verificar acceso:', error);
      alert('Error al verificar acceso al formulario. Por favor intenta nuevamente.');
    }
  };

  // 3. Añadir un useEffect para actualizar la accesibilidad cuando cambia la sección actual
  useEffect(() => {
    if (currentSection) {
      // Si llegamos a una sección, marcarla como accesible
      const newAccessibleForms = [...accessibleForms];
      if (!newAccessibleForms.includes(currentSection)) {
        newAccessibleForms.push(currentSection);
        setAccessibleForms(newAccessibleForms);
        localStorage.setItem(`accessible_forms_${solicitudId}`, JSON.stringify(newAccessibleForms));
      }
      
      // También marcar secciones anteriores como accesibles
      for (let i = 1; i < currentSection; i++) {
        if (!newAccessibleForms.includes(i)) {
          newAccessibleForms.push(i);
        }
      }
      
      // Actualizar si hay cambios
      if (newAccessibleForms.length !== accessibleForms.length) {
        setAccessibleForms(newAccessibleForms);
        localStorage.setItem(`accessible_forms_${solicitudId}`, JSON.stringify(newAccessibleForms));
      }
    }
  }, [currentSection, accessibleForms, solicitudId]);

  // Añadir un efecto para actualizar el historial con la sección actual
  useEffect(() => {
    if (currentSection && solicitudId) {
      const historialFormulariosKey = `historial_formularios_${solicitudId}`;
      let historialFormularios = JSON.parse(localStorage.getItem(historialFormulariosKey) || '[]');
      
      // Si estamos en un formulario, añadirlo al historial
      if (!historialFormularios.includes(currentSection)) {
        historialFormularios.push(currentSection);
        localStorage.setItem(historialFormulariosKey, JSON.stringify(historialFormularios));
      }
    }
  }, [currentSection, solicitudId]);

  // Renderizar la sección correspondiente según currentSection
  const renderFormSection = () => {
    // Asegura que userData siempre tenga id_usuario definido
    const safeUserData = {
      ...userData,
      id_usuario: userData?.id_usuario ?? '',
      name: userData?.name ?? '',
    };
    switch (currentSection) {
      case 1:
        return (
          <FormSection 
            formId={1} 
            formData={formData || {}}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            setCurrentSection={setCurrentSection}
            currentSection={currentSection || 1}
            escuelas={escuelas || []}
            departamentos={departamentos || []}
            secciones={secciones || []}
            programas={programasFiltrados || []} 
            oficinas={oficinas || []}
            userData={safeUserData}
            currentStep={currentStep || 0}
            handleFileChange={handleFileChange}
            active={true}
            initialErrors={{}}
            errors={{errors}}
          />
        );
      case 2:
        return (
          <FormSection2 
            formId={2} 
            userData={safeUserData} 
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleFileChange={handleFileChange}
            setCurrentSection={handleSectionChange} 
            currentStep={currentStep} 
            validateStep={validateStep}
          />
        );
      case 3:
        return (
          <FormSection3 
            formId={3} 
            userData={safeUserData} 
            formData={formData} 
            handleInputChange={handleInputChange} 
            setCurrentSection={handleSectionChange} 
            currentStep={currentStep}
            validateStep={validateStep}
          />
        );
      case 4:
        return (
          <FormSection4 
            formId={4} 
            userData={safeUserData} 
            formData={formData}  
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            currentStep={currentStep}
            validateStep={validateStep}
          />
        );
      default:
        return null;
    }
  };

  // Calcula los pasos completados para el FormStepper
  const getFormSectionCompletedSteps = () => {
    return Array.from({ length: currentSection - 1 }, (_, i) => i);
  };

  return (
    <Container sx={{
      marginTop: isSmallScreen ? '100px' : '130px',
      marginBottom: isSmallScreen ? '150px' : '20px',
      maxWidth: '100%',
      padding: { xs: '0 15px', sm: '0 20px' }
    }}>
      <FormStepper 
        activeStep={currentSection - 1} 
        steps={sectionShortTitles} 
        setCurrentSection={handleSectionChange} 
        highestStepReached={highestSectionReached - 1} 
        completedSteps={calculateCompletedSteps()} 
        clickableSteps={accessibleForms.map(num => num - 1)} 

      />
      <Typography variant={isSmallScreen ? 'h5' : 'h4'} gutterBottom sx={{ fontWeight: 'bold', textAlign: isSmallScreen ? 'center' : 'left' }}>
        {sectionTitles[currentSection - 1]}
      </Typography>
      {isReadOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Modo solo lectura: puedes navegar entre pasos, pero no se guardaran cambios.
        </Alert>
      )}
      {renderFormSection()}
      <Dialog open={false} onClose={() => {}}>
        <DialogTitle>Datos Guardados</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sus datos han sido guardados exitosamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

FormPage.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
  }),
};

export default FormPage;
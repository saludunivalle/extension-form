import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, useMediaQuery, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import FormSection from '../components/FormSection/FormSection';
import FormSection2 from '../components/FormSection2/FormSection2';
import FormSection3 from '../components/FormSection3/FormSection3';
import FormSection4 from '../components/FormSection4/FormSection4';
import FormStepper from './FormStepper';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';

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

function FormPage({ userData }) {
  const [searchParams] = useSearchParams();
  const { formId } = useParams(); // Se extrae la sección actual de la URL
  const formStep = searchParams.get('paso') || 0;
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Obtenemos el id de solicitud exclusivamente de la URL
  const solicitudId = searchParams.get('solicitud');

  // Si no existe id en la URL, se solicita uno nuevo y se redirige a la sección 1, paso 0.
  useEffect(() => {
    if (!solicitudId) {
      // Si no existe id en la URL, obtener un nuevo a través de getLastId con la hoja SOLICITUDES2
      axios.get('https://siac-extension-server.vercel.app/getLastId', {
        params: { sheetName: 'SOLICITUDES2' }
      })
      .then(response => {
        const nuevoId = response.data.lastId + 1;
        localStorage.setItem('id_solicitud', nuevoId);
        navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`, { replace: true });
      })
      .catch(error => {
        console.error('Error al obtener un nuevo ID de solicitud:', error);
      });
    } else {
      localStorage.setItem('id_solicitud', solicitudId);
    }
  }, [solicitudId, navigate, userData.id]);

  // Estados para la sección y el paso actuales
  const [currentSection, setCurrentSection] = useState(parseInt(formId, 10) || 1);
  const [currentStep, setCurrentStep] = useState(
    !isNaN(parseInt(formStep, 10)) && parseInt(formStep, 10) >= 0 ? parseInt(formStep, 10) : 0
  );

  // formData se inicializa con el id de solicitud obtenido de la URL
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('formData');
    return savedFormData ? JSON.parse(savedFormData) : {
    id_solicitud: solicitudId || '',
    // Resto de campos inicializados según las hojas de la solicitud
    fecha_solicitud: '', nombre_actividad: '', nombre_solicitante: userData?.name || '',
    dependencia_tipo: '', nombre_escuela: '', nombre_departamento: '',
    nombre_seccion: '', nombre_dependencia: '', introduccion: '',
    objetivo_general: '', objetivos_especificos: '', justificacion: '',
    metodologia: '', tipo: '', otro_tipo: '', modalidad: '',
    horas_trabajo_presencial: '', horas_sincronicas: '', total_horas: '',
    programCont: '', dirigidoa: '', creditos: '', cupo_min: '', cupo_max: '',
    profesor_participante: '', nombre_coordinador: '', correo_coordinador: '',
    tel_coordinador: '', perfil_competencia: '', formas_evaluacion: '',
    certificado_solicitado: '', calificacion_minima: '', razon_no_certificado: '',
    valor_inscripcion: '', becas_convenio: '', becas_estudiantes: '',
    becas_docentes: '', becas_egresados: '', becas_funcionarios: '',
    becas_otros: '', becas_total: '', periodicidad_oferta: '', fechas_actividad: '',
    organizacion_actividad: '', otro_tipo_act: '', fecha_por_meses: '',
    fecha_inicio: '', fecha_final: '', extension_solidaria: '',
    costo_extension_solidaria: '', personal_externo: '', pieza_grafica: '',
    // Hoja SOLICITUDES3
    ingresos_cantidad: '', ingresos_vr_unit: '',
    personal_universidad_cantidad: '', personal_universidad_vr_unit: '',
    honorarios_docentes_cantidad: '', honorarios_docentes_vr_unit: '',
    otro_personal_cantidad: '', otro_personal_vr_unit: '',
    escuela_departamento_porcentaje: '', escuela_departamento: '',
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
    total_infraestructura_universitaria: '', imprevistos: '', total_aportes_univalle: '',
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
    const savedFormData = localStorage.getItem('formData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, [solicitudId]);

  // Cargar datos de la solicitud desde el backend sin usar cache local
  useEffect(() => {
    const fetchSolicitudData = async () => {
      if (solicitudId) {
        try {
          const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
            params: { id_solicitud: solicitudId, timestamp: new Date().getTime() }
          });
          setFormData(prev => ({ ...prev, ...response.data }));
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.warn('No se encontraron datos para la solicitud, se usa id de URL');
            setFormData(prev => ({ ...prev, id_solicitud: solicitudId }));
          } else {
            console.error('Error al cargar los datos de la solicitud:', error);
          }
        }
      }
    };
    fetchSolicitudData();
  }, [solicitudId]);

  // Actualización de currentSection y currentStep según la URL
  useEffect(() => {
    const parsedFormId = parseInt(formId, 10);
    const parsedFormStep = parseInt(formStep, 10);
    const isFormIdValid = !isNaN(parsedFormId) && parsedFormId >= 1 && parsedFormId <= sectionTitles.length;
    const isFormStepValid = !isNaN(parsedFormStep) && parsedFormStep >= 0;
    if (isFormIdValid && isFormStepValid) {
      setCurrentSection(parsedFormId);
      setCurrentStep(parsedFormStep);
    } else {
      setCurrentSection(1);
      setCurrentStep(0);
    }
  }, [formId, formStep]);

  // Validación de currentStep según la sección
  useEffect(() => {
    const maxSteps = { 1: 5, 2: 3, 3: 4, 4: 2 };
    const currentMaxSteps = maxSteps[currentSection] || 0;
    if (currentStep >= currentMaxSteps) {
      setCurrentStep(0);
    }
  }, [currentSection, currentStep]);

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
        const response = await axios.get('https://siac-extension-server.vercel.app/getProgramasYOficinas');
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
      const departamentosFiltrados = [
        ...new Set(
          programas
            .filter(item => item.Escuela === formData.nombre_escuela)
            .map(item => item.Departamento || "General")
        ),
      ];
      if (departamentosFiltrados.length === 1 && departamentosFiltrados[0] === "General") {
        setFormData(prev => ({ ...prev, nombre_departamento: "General" }));
      }
      setDepartamentos(departamentosFiltrados);
    } else {
      setDepartamentos([]);
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
    const { name, value, files } = event.target;
    setFormData(prev => {
      let updated = { ...prev, [name]: files ? files[0] : value };
      if (name === 'nombre_escuela') {
        updated.nombre_departamento = '';
        updated.nombre_seccion = '';
        updated.nombre_dependencia = '';
      }
      if (name === 'nombre_departamento') {
        updated.nombre_seccion = '';
        updated.nombre_dependencia = '';
      }
      if (name === 'nombre_seccion') {
        updated.nombre_dependencia = '';
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Actualiza la sección actual y navega
  const handleSectionChange = (newSection) => {
    setCurrentSection(newSection);
    navigate(`/formulario/${newSection}?solicitud=${solicitudId}&paso=0`, { replace: true });
  };

  // Renderizar la sección correspondiente según currentSection
  const renderFormSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <FormSection 
            formId={1} 
            userData={userData} 
            formData={formData} 
            setFormData={setFormData} 
            escuelas={escuelas} 
            departamentos={departamentos} 
            secciones={secciones} 
            oficinas={oficinas} 
            handleInputChange={handleInputChange} 
            setCurrentSection={handleSectionChange} 
            programas={programasFiltrados} 
            currentStep={currentStep} 
            handleFileChange={handleFileChange}
            active={currentSection === 1}  /* Se pasa la prop requerida */
          />
        );
      case 2:
        return (
          <FormSection2 
            formId={2} 
            userData={userData} 
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            setCurrentSection={handleSectionChange} 
            currentStep={currentStep} 
          />
        );
      case 3:
        return (
          <FormSection3 
            formId={3} 
            userData={userData} 
            formData={formData} 
            handleInputChange={handleInputChange} 
            setCurrentSection={handleSectionChange} 
            currentStep={currentStep}
          />
        );
      case 4:
        return (
          <FormSection4 
            formId={4} 
            userData={userData} 
            formData={formData}  
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            currentStep={currentStep}
          />
        );
      default:
        return null;
    }
  };

  // Calcula los pasos completados para el FormStepper
  const calculateCompletedSteps = () => {
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
        highestStepReached={1} 
        completedSteps={calculateCompletedSteps()} 
      />
      <Typography variant={isSmallScreen ? 'h5' : 'h4'} gutterBottom sx={{ fontWeight: 'bold', textAlign: isSmallScreen ? 'center' : 'left' }}>
        {sectionTitles[currentSection - 1]}
      </Typography>
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
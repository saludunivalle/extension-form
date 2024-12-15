  import React, { useState, useEffect } from 'react';
  import { 
    Container, Typography, useMediaQuery, Box, 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button 
  } from '@mui/material';
  import FormSection from '../components/FormSection/FormSection';
  import FormSection3 from '../components/FormSection3/FormSection3';
  import FormSection4 from '../components/FormSection4/FormSection4';
  import FormSection5 from '../components/FormSection5/FormSection5';
  import axios from 'axios';
  import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
  import FormStepper from './FormStepper'; // Importa el componente FormStepper

  // Definimos los títulos respectivos para cada sección del formulario
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
    const { formId } = useParams(); // Extraemos formId directamente desde los parámetros de la URL
    const formStep = searchParams.get('paso') || 0; // Obtener el paso
    const [currentSection, setCurrentSection] = useState(parseInt(formId, 10)); // Sección basada en URL
    const [currentStep, setCurrentStep] = useState(parseInt(formStep, 10)); // Paso basado en URL
    const navigate = useNavigate();
    const [programasFiltrados, setProgramasFiltrados] = useState([]);


    useEffect(() => {
      const parsedFormId = parseInt(formId, 10);
      const parsedFormStep = parseInt(formStep, 10);
    
      // Validar que los valores estén dentro de los rangos permitidos
      const isFormIdValid = !isNaN(parsedFormId) && parsedFormId >= 1 && parsedFormId <= sectionTitles.length;
      const isFormStepValid = !isNaN(parsedFormStep) && parsedFormStep >= 0;
    
      if (!localStorage.getItem('id_solicitud')) {
        // Nueva solicitud: comienza desde el primer formulario y paso
        setCurrentSection(1);
        setCurrentStep(0);
      } else if (isFormIdValid && isFormStepValid) {
        setCurrentSection(parsedFormId);
        setCurrentStep(parsedFormStep); // Usa el paso proporcionado si es válido
      } else {
        // Valores no válidos: vuelve al primer formulario y paso
        setCurrentSection(1);
        setCurrentStep(0);
      }
    }, [formId, formStep]);
    
    useEffect(() => {
      const maxSteps = {
        1: 5, // Ejemplo: Formulario 1 tiene 5 pasos
        2: 3, // Formulario 2 tiene 3 pasos
        3: 4, // Formulario 3 tiene 4 pasos
        4: 2, // Formulario 4 tiene 2 pasos
      };
    
      const currentMaxSteps = maxSteps[currentSection] || 0;
      if (currentStep >= currentMaxSteps) {
        setCurrentStep(0); // Reinicia al primer paso si el actual no es válido
      }
    }, [currentSection, currentStep]);
    

    const location = useLocation();
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const [showDialog, setShowDialog] = useState(false); // Estado para controlar el diálogo
    const [highestStepReached, setHighestStepReached] = useState(1); // Iniciamos con el paso 1 alcanzado
    const [escuelas, setEscuelas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [oficinas, setOficinas] = useState([]);
    const [error, setError] = useState(false);
    const solicitudId = searchParams.get('solicitud'); // Obtenemos el id_solicitud desde la URL
    const [formData, setFormData] = useState({
      // Hoja SOLICITUDES
      id_solicitud: '',
      
    
      // Hoja SOLICITUDES2
      fecha_solicitud: '',
      nombre_actividad: '',
      nombre_solicitante: userData?.name || '',
      dependencia_tipo: '',
      nombre_escuela: '',
      nombre_departamento: '',
      nombre_seccion: '',
      nombre_dependencia: '',
      introduccion: '',
      objetivo_general: '',
      objetivos_especificos: '',
      justificacion: '',
      metodologia: '',
      tipo: '',
      otro_tipo: '',
      modalidad: '',
      horas_trabajo_presencial: '',
      horas_sincronicas: '',
      total_horas: '',
      programCont: '',
      dirigidoa: '',
      creditos: '',
      cupo_min: '',
      cupo_max: '',
      profesor_participante: '',
      nombre_coordinador: '',
      correo_coordinador: '',
      tel_coordinador: '',
      perfil_competencia: '',
      formas_evaluacion: '',
      certificado_solicitado: '',
      calificacion_minima: '',
      razon_no_certificado: '',
      valor_inscripcion: '',
      becas_convenio: '',
      becas_estudiantes:'',
      becas_docentes: '',
      becas_egresados: '',
      becas_funcionarios: '',
      becas_otros: '',
      becas_total: '',
      periodicidad_oferta: '',
      fechas_actividad: '',
      organizacion_actividad: '',
      otro_tipo_act: '',
      fecha_por_meses: '',
      fecha_inicio: '',
      fecha_final: '',
      extension_solidaria: '',
      costo_extension_solidaria: '',
      personal_externo: '',
      pieza_grafica: '',
    
      // Hoja SOLICITUDES3
      ingresos_cantidad: '',
      ingresos_vr_unit: '',
      personal_universidad_cantidad: '',
      personal_universidad_vr_unit: '',
      honorarios_docentes_cantidad: '',
      honorarios_docentes_vr_unit: '',
      otro_personal_cantidad: '',
      otro_personal_vr_unit: '',
      escuela_departamento_porcentaje: '',
      escuela_departamento: '',
      total_recursos: '',
      coordinador_actividad: '',
      visto_bueno_unidad: '',
      total_ingresos: '',
      total_costos_personal: '',
      total_personal_universidad: '',
      total_honorarios_docentes: '',
      total_otro_personal: '',
      total_materiales_sumi: '',
      total_gastos_alojamiento: '',
      total_gastos_alimentacion: '',
      total_gastos_transporte: '',
      total_equipos_alquiler_compra: '',
      total_dotacion_participantes: '',
      total_carpetas: '',
      total_libretas: '',
      total_lapiceros: '',
      total_memorias: '',
      total_marcadores_papel_otros: '',
      total_impresos: '',
      total_labels: '',
      total_certificados: '',
      total_escarapelas: '',
      total_fotocopias: '',
      total_estacion_cafe: '',
      total_transporte_mensaje: '',
      total_refrigerios: '',
      total_infraestructura_fisica: '',
      total_gastos_generales: '',
      total_infraestructura_universitaria: '',
      imprevistos: '',
      total_aportes_univalle: '',

    
      // Hoja SOLICITUDES4
      descripcionPrograma: '',
      identificacionNecesidades: '',
      atributosBasicos: '',
      atributosDiferenciadores: '',
      competencia: '',
      programa: '',
      programasSimilares: '',
      estrategiasCompetencia: '',
      personasInteres: '',
      personasMatriculadas: '',
      otroInteres: '',
      innovacion: '',
      solicitudExterno: '',
      interesSondeo: '',
      llamadas: '',
      encuestas: '',
      webinar: '',
      preregistro: '',
      mesasTrabajo: '',
      focusGroup: '',
      desayunosTrabajo: '',
      almuerzosTrabajo: '',
      openHouse: '',
      valorEconomico: '',
      modalidadPresencial: '',
      modalidadVirtual: '',
      modalidadSemipresencial: '',
      otraModalidad: '',
      beneficiosTangibles: '',
      beneficiosIntangibles: '',
      particulares: '',
      colegios: '',
      empresas: '',
      egresados: '',
      colaboradores: '',
      otros_publicos_potenciales: '',
      tendenciasActuales: '',
      dofaDebilidades: '',
      dofaOportunidades: '',
      dofaFortalezas: '',
      dofaAmenazas: '',
      paginaWeb: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      correo: '',
      prensa: '',
      boletin: '',
      llamadas_redes: '',
      otro_canal: '',
    
      // Hoja SOLICITUDES5
      proposito: '',
      comentario: '',
      fecha: '',
      elaboradoPor: '',
      aplicaDiseno1: '',
      aplicaDiseno2: '',
      aplicaDiseno3: '',
      aplicaLocacion1: '',
      aplicaLocacion2: '',
      aplicaLocacion3: '',
      aplicaDesarrollo1: '',
      aplicaDesarrollo2: '',
      aplicaDesarrollo3: '',
      aplicaDesarrollo4: '',
      aplicaDesarrollo5: '',
      aplicaCierre1: '',
      aplicaCierre2: '',
      aplicaOtros1: '',
      aplicaOtros2: ''
    });

    // Cargar datos de la solicitud si hay un id_solicitud
  useEffect(() => {
    const fetchSolicitudData = async () => {
      if (solicitudId) {
        console.log('Cargando datos de la solicitud:', solicitudId);
        //setLoading(true);
        try {
          const response = await axios.get(`https://siac-extension-server.vercel.app/getSolicitud`, {
            params: { id_solicitud: solicitudId }
          });
          const data = response.data;
          
          // Combina los datos de todas las hojas en formData
          const combinedData = {
            ...data.SOLICITUDES2,
            ...data.SOLICITUDES3,
            ...data.SOLICITUDES4,
            ...data.SOLICITUDES5,
          };

          setFormData(combinedData);
        } catch (error) {
          console.error('Error al cargar los datos de la solicitud:', error);
        } finally {
          //setLoading(false);
        }
      }
    };

    fetchSolicitudData();
  }, [solicitudId]);

  useEffect(() => {
    if (!solicitudId) {
      // Si no hay solicitud en la URL, verificar en el localStorage
      const storedId = localStorage.getItem('id_solicitud');
      if (storedId) {
        navigate(`/formulario/1?solicitud=${storedId}&paso=0`);
      } else {
        // Si no hay ni en la URL ni en el localStorage, redirige o lanza un error
        alert('No se encontró una solicitud activa. Por favor, crea una nueva.');
        navigate('/');
      }
    }
  }, [solicitudId, navigate]);

  
    const handleFileChange = (e) => {
      const { name, files } = e.target;
      const file = files[0];
      if (file) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: file,
        }));
      }
    };
   

    // Fetch de los datos de escuelas y oficinas
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

    // Manejo de dependencias (escuelas, departamentos, secciones y programas)
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
          setFormData((prevFormData) => ({
            ...prevFormData,
            nombre_departamento: "General",
          }));
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
              .filter(
                item =>
                  item.Escuela === formData.nombre_escuela &&
                  (item.Departamento === formData.nombre_departamento || (!item.Departamento && formData.nombre_departamento === "General"))
              )
              .map(item => item.Sección || "General")
          ),
        ];
    
        if (seccionesFiltradas.length === 1 && seccionesFiltradas[0] === "General") {
          setFormData((prevFormData) => ({
            ...prevFormData,
            nombre_seccion: "General",
          }));
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
    
        console.log('Programas filtrados para la sección seleccionada:', programasRelacionados);
        setProgramasFiltrados(programasRelacionados);
      } else {
        setProgramasFiltrados([]);
      }
    }, [formData.nombre_seccion, formData.nombre_departamento, formData.nombre_escuela, programas]);
    
    const handleInputChange = (event) => {
      const { name, value, files } = event.target;
    
      setFormData((prevFormData) => {
        let updatedFormData = { ...prevFormData, [name]: files ? files[0] : value };
    
        if (name === 'nombre_escuela') {
          updatedFormData.nombre_departamento = '';
          updatedFormData.nombre_seccion = '';
          updatedFormData.nombre_dependencia = '';
        }
    
        if (name === 'nombre_departamento') {
          updatedFormData.nombre_seccion = '';
          updatedFormData.nombre_dependencia = '';
        }
    
        if (name === 'nombre_seccion') {
          updatedFormData.nombre_dependencia = '';
        }
    
        return updatedFormData;
      });
    };    

    const handleSectionChange = (newSection) => {
      setCurrentSection(newSection);
      if (newSection > highestStepReached) {
        setHighestStepReached(newSection);
      }
    };  

    const handleCloseDialog = () => {
      setShowDialog(false);
    };

    const renderFormSection = () => {
      switch (currentSection) {
        case 1:
          return <FormSection  formId={1} userData={userData} formData={formData} escuelas={escuelas} departamentos={departamentos} secciones={secciones} oficinas={oficinas} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange}   programas={programasFiltrados} currentStep={currentStep} handleFileChange={handleFileChange} />;
        case 2:
          return <FormSection3 formId={2} userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep} />;
        case 3:
          return <FormSection5 formId={3} userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep}/>;
        case 4:
          return <FormSection4 formId={4} userData={userData} formData={formData} handleInputChange={handleInputChange} currentStep={currentStep}/>;
        default:
          return null;
      }
    };

    const calculateCompletedSteps = () => {
      return Array.from({ length: currentSection - 1 }, (_, i) => i); 
    };

    return (
      <Container sx={{
        marginTop: isSmallScreen ? '130px' : '130px',
        marginBottom: isSmallScreen ? '200px' : '20px',
        maxWidth: '100%',
        padding: { xs: '0 15px', sm: '0 20px' }
      }}>

        {/* Agrega el FormStepper al layout */}
        <FormStepper activeStep={currentSection - 1} steps={sectionShortTitles} setCurrentSection={handleSectionChange} highestStepReached={highestStepReached} completedSteps={calculateCompletedSteps()} />
        {/* Contenido del formulario */}
        <Typography variant={isSmallScreen ? 'h5' : 'h4'} gutterBottom sx={{fontWeight: 'bold'}}>
          {sectionTitles[currentSection - 1]}
        </Typography>

        {renderFormSection()}

        <Dialog open={showDialog} onClose={handleCloseDialog}>
          <DialogTitle>Datos Guardados</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sus datos han sido guardados exitosamente.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  export default FormPage;

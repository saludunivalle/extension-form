  import React, { useState, useEffect } from 'react';
  import { 
    Container, Typography, useMediaQuery, Box, 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button 
  } from '@mui/material';
  import FormSection from '../components/FormSection/FormSection';
  import FormSection2 from '../components/FormSection2/FormSection2';
  import FormSection3 from '../components/FormSection3/FormSection3';
  import FormSection4 from '../components/FormSection4/FormSection4';
  import FormSection5 from '../components/FormSection5/FormSection5';
  import axios from 'axios';
  import { useLocation, useSearchParams } from 'react-router-dom';
  import FormStepper from './FormStepper'; // Importa el componente FormStepper

  // Definimos los títulos respectivos para cada sección del formulario
  const sectionTitles = [
    'Formulario F-04-MP-05-01-01 - Propuesta', 
    'Formulario F-05-MP-05-01-01 - Aprobación', 
    'Formulario F-06-MP-05-01-01 - Presupuesto', 
    'Formulario F-07-MP-05-01-01 - Indentificación de Mercadeo', 
    'Formulario F-08-MP-05-01-01 - Riesgos Potenciales'
  ];

  function FormPage({ userData }) {
    const [searchParams] = useSearchParams();
    const formId = searchParams.get('formulario') || 1; // Obtener el formulario
    const formStep = searchParams.get('paso') || 0; // Obtener el paso
    const [currentSection, setCurrentSection] = useState(parseInt(formId, 10)); // Sección basada en URL
    const [currentStep, setCurrentStep] = useState(parseInt(formStep, 10)); // Paso basado en URL
  
    useEffect(() => {
      // Actualiza la sección y el paso basado en los parámetros de búsqueda
      setCurrentSection(parseInt(formId, 10));
      setCurrentStep(parseInt(formStep, 10));
    }, [formId, formStep]);

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
    const [formData, setFormData] = useState({
      // Hoja SOLICITUDES
      id_solicitud: '',
      introduccion: '',
      objetivo_general: '',
      objetivos_especificos: '',
      justificacion: '',
      descripcion: '',
      alcance: '',
      metodologia: '',
      dirigido_a: '',
      programa_contenidos: '',
      duracion: '',
      certificacion: '',
      recursos: '',
    
      // Hoja SOLICITUDES2
      fecha_solicitud: '',
      nombre_actividad: '',
      nombre_solicitante: userData?.name || '',
      dependencia_tipo: '',
      nombre_escuela: '',
      nombre_departamento: '',
      nombre_seccion: '',
      nombre_dependencia: '',
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
      becas_convenio: 0,
      becas_estudiantes: 0,
      becas_docentes: 0,
      becas_egresados: 0,
      becas_funcionarios: 0,
      becas_otros: 0,
      becas_total: 0,
      periodicidad_oferta: '',
      fechas_actividad: '',
      organizacion_actividad: '',
      otro_tipo_act: '',
      fecha_por_meses: '',
      fecha_inicio: '',
      fecha_final: '',
    
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

    // Obtener los parámetros de la URL (formulario y paso)
    useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      const formNumber = parseInt(searchParams.get('formulario'), 10);
      const formPaso = parseInt(searchParams.get('paso'), 10);
    
      if (!isNaN(formNumber) && formNumber >= 1 && formNumber <= 5 && !isNaN(formPaso)) {
        setCurrentSection(formNumber); // Actualizamos la sección actual con el formulario
        setCurrentStep(formPaso - 1);  // Actualizamos el paso actual
      } else {
        // Si no hay parámetros válidos, mostrar un formulario predeterminado (por ejemplo, el primero)
        setCurrentSection(1);
        setCurrentStep(0);
      }
    }, [location]);
  

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
        setDepartamentos(departamentosFiltrados);

        if (departamentosFiltrados.length === 0) {
          setFormData(prevFormData => ({
            ...prevFormData,
            nombre_departamento: '',
            nombre_seccion: '',
            nombre_dependencia: '',
          }));
        }
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
        setSecciones(seccionesFiltradas);
      }
    }, [formData.nombre_departamento, formData.nombre_escuela, programas]);

    useEffect(() => {
      if (formData.nombre_seccion) {
        const programasFiltrados = programas.filter(
          item =>
            item.Escuela === formData.nombre_escuela &&
            (item.Departamento === formData.nombre_departamento || (!item.Departamento && formData.nombre_departamento === "General")) &&
            (item.Sección === formData.nombre_seccion || (!item.Sección && formData.nombre_seccion === "General"))
        );

        setProgramas(programasFiltrados);

        if (!formData.nombre_dependencia && programasFiltrados.length > 0) {
          setFormData(prevFormData => ({
            ...prevFormData,
            nombre_dependencia: programasFiltrados[0].Programa || "General",
          }));
        }
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

        if (!updatedFormData.nombre_dependencia || updatedFormData.nombre_dependencia === "General") {
          updatedFormData.nombre_dependencia = updatedFormData.nombre_escuela;
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
          return <FormSection2 formId={1} userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep} />;
        case 2:
          return <FormSection  formId={2} userData={userData} formData={formData} escuelas={escuelas} departamentos={departamentos} secciones={secciones} programas={programas} oficinas={oficinas} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep} />;
        case 3:
          return <FormSection3 formId={3} userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep} />;
        case 4:
          return <FormSection4 formId={4} userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} currentStep={currentStep}/>;
        case 5:
          return <FormSection5 formId={5} userData={userData} formData={formData} handleInputChange={handleInputChange} currentStep={currentStep}/>;
        default:
          return null;
      }
    };

    return (
      <Container sx={{
        marginTop: isSmallScreen ? '130px' : '130px',
        marginBottom: isSmallScreen ? '200px' : '20px',
        maxWidth: '100%',
        padding: { xs: '0 15px', sm: '0 20px' }
      }}>

        {/* Agrega el FormStepper al layout */}
        <FormStepper activeStep={currentSection - 1} steps={sectionTitles} setCurrentSection={handleSectionChange} highestStepReached={highestStepReached} />
        {/* Contenido del formulario */}
        <Typography variant={isSmallScreen ? 'h5' : 'h4'} gutterBottom>
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

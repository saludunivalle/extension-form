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
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [currentSection, setCurrentSection] = useState(1); // Iniciamos con la sección 1
  const [showDialog, setShowDialog] = useState(false); // Estado para controlar el diálogo
  const [highestStepReached, setHighestStepReached] = useState(1); // Iniciamos con el paso 1 alcanzado
  const [formData, setFormData] = useState({
    id_solicitud: '',
    fecha_solicitud: '',
    nombre_actividad: '',
    nombre_solicitante: userData?.name || '',
    nombre_dependencia: '',
    tipo: '',
    modalidad: '',
    tipo_oferta: '',
    ofrecido_por: '',
    unidad_academica: '',
    ofrecido_para: '',
    total_horas: '',
    horas_trabajo_presencial: '',
    horas_sincronicas: '',
    creditos: '',
    cupo_min: '',
    cupo_max: '',
    nombre_coordinador: '',
    correo_coordinador: '',
    tel_coordinador: '',
    profesor_participante: '',
    formas_evaluacion: '',
    certificado_solicitado: '',
    calificacion_minima: '',
    razon_no_certificado: '',
    valor_inscripcion: '',
    becas_convenio: 0,
    becas_estudiantes: 0,
    becas_docentes: 0,
    becas_otros: 0,
    becas_total: 0,
    fechas_actividad: '',
    fecha_por_meses: '',
    fecha_inicio: '',
    fecha_final: '',
    organizacion_actividad: '',
    nombre_firma: '',
    cargo_firma: '',
    firma: '',
    matriz_riesgo: ''
  });

  const [escuelas, setEscuelas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [error, setError] = useState(false);

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
        return <FormSection2 userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} />;
      case 2:
        return <FormSection  userData={userData} formData={formData} escuelas={escuelas} departamentos={departamentos} secciones={secciones} programas={programas} oficinas={oficinas} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} />;
      case 3:
        return <FormSection3 userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} />;
      case 4:
        return <FormSection4 userData={userData} formData={formData} handleInputChange={handleInputChange} setCurrentSection={handleSectionChange} />;
      case 5:
        return <FormSection5 userData={userData} formData={formData} handleInputChange={handleInputChange} />;
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

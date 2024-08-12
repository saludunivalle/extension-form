import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Stepper, Step, StepLabel, useMediaQuery, Box } from '@mui/material';
import FormSection from '../components/FormSection';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const steps = ['Datos Generales', 'Detalles de la Actividad', 'Certificación y Evaluación', 'Información Coordinador', 'Información Adicional'];

function FormPage({ userData }) {
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:600px)'); 
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    id_solicitud: '',
    fecha_solicitud: '',
    nombre_actividad: '',
    nombre_solicitante: userData?.name || '',
    nombre_dependencia: '',
    tipo: '',
    modalidad: '',
    ofrecido_por: '',
    unidad_academica: '',
    ofrecido_para: '',
    intensidad_horaria: '',
    horas_modalidad: '',
    horas_trabj_ind: '',
    creditos: '',
    cupo_min: '',
    cupo_max: '',
    nombre_coordinador: '',
    tel_coordinador: '',
    profesor_participante: '',
    formas_evaluacion: '',
    certificado_solicitado: '',
    calificacion_minima: '',
    razon_no_certificado: '',
    valor_inscripcion: '',
    becas_convenio: 2,
    becas_estudiantes: 0,
    becas_docentes: 0,
    becas_otros: 0,
    becas_total: 2,
    fechas_actividad: '',
    organizacion_actividad: '',
    nombre_firma: '',
    cargo_firma: '',
    firma: '',
    anexo_documento: '' 
  });

  useEffect(() => {
    const fetchLastId = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const solicitudId = queryParams.get('solicitud');

        if (solicitudId) {
          const response = await axios.get('https://siac-extension-server.vercel.app/getFormData', {
            params: { id_solicitud: solicitudId }
          });

          setFormData(response.data);
        } else {
          const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
            params: { sheetName: 'SOLICITUDES' }
          });
          const newId = parseInt(response.data.lastId, 10) + 1;
          setFormData((prevState) => ({
            ...prevState,
            id_solicitud: newId,
          }));
        }
      } catch (error) {
        console.error('Error al obtener el ID o los datos del formulario:', error);
      }
    };

    fetchLastId();
  }, [location.search]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async () => {
    if (!userData) {
      console.error('userData no está definido');
      return;
    }

    const isLastStep = activeStep === steps.length - 1;

    try {
      let fileUrl = '';
      if (formData.anexo_documento && isLastStep) {
        // Subir el archivo a Google Drive
        const formDataFile = new FormData();
        formDataFile.append('anexo_documento', formData.anexo_documento);

        const uploadResponse = await axios.post('https://siac-extension-server.vercel.app/uploadFile', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        fileUrl = uploadResponse.data.fileUrl;
      }

      const response = await axios.post('https://siac-extension-server.vercel.app/saveProgress', {
        id_usuario: userData.id,
        formData: { ...formData, anexo_documento: fileUrl },
        activeStep,  
      });

      console.log(isLastStep ? 'Formulario enviado:' : 'Progreso guardado:', response.data);

      if (!isLastStep) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } catch (error) {
      console.error(isLastStep ? 'Error al enviar el formulario:' : 'Error al guardar el progreso:', error);
    }
  };

  return (
    <Container sx={{ 
      marginTop: isSmallScreen ? '130px' : '130px', 
      marginBottom: isSmallScreen ? '200px' : '20px',
      maxWidth: '100%', 
      padding: { xs: '0 15px', sm: '0 20px' } 
    }}>
      <Typography variant={ isSmallScreen ? 'h5' : 'h4'} gutterBottom>
        Formulario de Solicitud
      </Typography>
      <Stepper activeStep={activeStep} orientation={isSmallScreen ? 'vertical' : 'horizontal'}>
        {steps.map((label) => (
          <Step key={label} sx={{ marginBottom: { xs: '10px', sm: '25px' } }}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <FormSection step={activeStep} formData={formData} handleInputChange={handleInputChange} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Container>
  );
}

export default FormPage;

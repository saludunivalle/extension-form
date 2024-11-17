import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography } from '@mui/material';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import Step4FormSection2 from './Step4FormSection2';
import Step5FormSection2 from './Step5FormSection2';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado
import { useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, currentStep  }) {
  const [activeStep, setActiveStep] = useState(currentStep);  // Usar currentStep como el paso inicial
  const location = useLocation(); // Obtener la ubicación actual
  const id_usuario = userData?.id_usuario;
  const steps = [
    'Introducción y Objetivos',
    'Justificación y Descripción',
    'Metodología y Público Objetivo',
    'Contenido y Duración',
    'Certificación y Recursos',
  ];
  
  const [idSolicitud, setIdSolicitud] = useState(null); // Para almacenar el id_solicitud
  const [showModal, setShowModal] = useState(false); // Estado para el modal


  // useEffect(() => {
  //   // Al cargar el componente, revisamos si hay parámetros en la URL (como el paso)
  //   const searchParams = new URLSearchParams(location.search);
  //   const paso = parseInt(searchParams.get('paso')) || 0; // Si no hay paso, iniciar en 0
  //   setActiveStep(paso); // Establecemos el paso actual
  // }, [location.search]);

  useEffect(() => {
    const obtenerUltimoId = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
          params: { sheetName: 'SOLICITUDES' },
        });
        const nuevoId = response.data.lastId + 1;
        setIdSolicitud(nuevoId); // Solo se genera una vez
        localStorage.setItem('id_solicitud', nuevoId); // Almacena en localStorage
      } catch (error) {
        console.error('Error al obtener el último ID:', error);
      }
    };

    if (!idSolicitud) {
      obtenerUltimoId();
    }
  }, [idSolicitud]);

  const handleNext = async () => {
    const hoja = 1; // Formulario 2 va en SOLICITUDES
    
    // Definir los datos específicos según el paso actual
    let pasoData = {};
  
    switch (activeStep) {
      case 0:
        pasoData = {
          introduccion: formData.introduccion,
          objetivo_general: formData.objetivo_general,
          objetivos_especificos: formData.objetivos_especificos,
        };
        break;
      case 1:
        pasoData = {
          justificacion: formData.justificacion,
          descripcion: formData.descripcion,
        };
        break;
      case 2:
        pasoData = {
          alcance: formData.alcance,
          metodologia: formData.metodologia,
          dirigido_a: formData.dirigido_a,
        };
        break;
      case 3:
        pasoData = {
          programa_contenidos: formData.programa_contenidos,
          duracion: formData.duracion,
        };
        break;
      case 4:
        pasoData = {
          certificacion: formData.certificacion,
          recursos: formData.recursos,
        };
        break;
      default:
        break;
    }
  
    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID de la solicitud
        formData: pasoData, // Datos específicos del paso actual
        paso: activeStep + 1, // Paso actual
        hoja, // Indica qué hoja se está usando
        userData: {
          id: userData.id, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });

      console.log('datos usuario', userData);
  
      // Mover al siguiente paso
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    const hoja = 1; // Cambia este valor según la hoja a la que corresponda el formulario
    
    // Datos del último paso (Paso 5)
    const pasoData = {
      certificacion: formData.certificacion,
      recursos: formData.recursos,
    };
  
    try {
      // Guardar los datos del último paso en Google Sheets
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID único de la solicitud
        formData: pasoData, // Datos del último paso (Paso 5)
        paso: 5, // El número del último paso
        hoja, // Indica qué hoja se está usando
        userData: {
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
      
      setShowModal(true); // Abre el modal
      // Después de guardar los datos, cambia de sección
      //setCurrentSection(2); // Cambia a FormSection (Formulario Aprobación)
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{
        '& .MuiStepLabel-label': {
          color: '#4F4F4F', // Color estándar para los labels no activos
          fontWeight: 'normal', // Peso normal para los labels no activos
          fontSize: '14px', // Tamaño estándar para los no activos
        },
        '& .MuiStepLabel-label.Mui-active': {
          color: '#0056b3', // Azul intenso para el texto del paso activo
          fontWeight: 'bold', // Negrilla para el texto activo
          fontSize: '16px', // Tamaño más grande para el texto activo
        },
        '& .MuiStepIcon-root': {
          fontSize: '24px', // Tamaño estándar para los íconos no activos
          color: '#4F4F4F', // Color estándar para los íconos no activos
        },
        '& .MuiStepIcon-root.Mui-active': {
          fontSize: '30px', // Tamaño más grande para íconos activos
          color: '#0056b3', // Azul intenso para los íconos activos
        },
        '& .MuiStepIcon-root.Mui-completed': {
          fontSize: '24px', // Tamaño estándar para íconos completados
          color: '#1976d2', // Azul para los íconos completados (el mismo color que el chulito)
        },
      }}>
        {steps.map((label, index) => (
          <Step key={index} sx={{ marginBottom: '20px' }}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>Ha finalizado el formulario Propuesta</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Desea continuar al siguiente formulario o salir al inicio?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCurrentSection(2)} color="primary">
              Continuar
            </Button>
            <Button onClick={() => window.location.href = '/'} color="secondary">
              Salir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default FormSection2;

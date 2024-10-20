import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography } from '@mui/material';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import Step4FormSection2 from './Step4FormSection2';
import Step5FormSection2 from './Step5FormSection2';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection2({ formData, handleInputChange, setCurrentSection, userData  }) {
  const [activeStep, setActiveStep] = useState(0);
  const id_usuario = userData?.id_usuario;
  const steps = [
    'Introducción y Objetivos',
    'Justificación y Descripción',
    'Metodología y Público Objetivo',
    'Contenido y Duración',
    'Certificación y Recursos',
  ];
  
  const [idSolicitud, setIdSolicitud] = useState(null); // Para almacenar el id_solicitud

  useEffect(() => {
    const obtenerUltimoId = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
          params: { sheetName: 'SOLICITUDES' }, // Cambia 'SOLICITUDES' según la hoja en la que estés trabajando
        });
        const nuevoId = response.data.lastId + 1;
        setIdSolicitud(nuevoId); // Establece el nuevo id_solicitud
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
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
  
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
  
      // Después de guardar los datos, cambia de sección
      setCurrentSection(2); // Cambia a FormSection (Formulario Aprobación)
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
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={index} sx={{marginBottom:'20px'}}>
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
      </Box>
    </Box>
  );
}

export default FormSection2;

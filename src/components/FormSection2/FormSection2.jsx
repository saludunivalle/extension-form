import React, { useState } from 'react';
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

  const handleNext = async () => {
    console.log("Datos del user:", userData);
    const id_usuario = userData?.id || ''; // Asegúrate de que `userData` contiene el id del usuario.
  
    if (!id_usuario) {
      console.error("Error: id_usuario no está definido.");
      return;
    }
  
    // Elimina las propiedades que tengan valores `undefined` para evitar problemas al enviarlas
    const sanitizedFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );
  
    console.log("Datos antes de enviar:", sanitizedFormData);
  
    try {
      const response = await axios.post("https://siac-extension-server.vercel.app/saveProgress", {
        id_usuario,
        formData: sanitizedFormData,
        activeStep,
      });
      console.log("Respuesta del servidor al guardar:", response.data);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  };
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    setCurrentSection(2); // Cambia a FormSection (Formulario Aprobación)
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

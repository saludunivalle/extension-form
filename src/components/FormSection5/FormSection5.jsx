import React, { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography } from '@mui/material';
import Step1FormSection5 from './Step1FormSection5';
import Step2FormSection5 from './Step2FormSection5';
import Step3FormSection5 from './Step3FormSection5';
import Step4FormSection5 from './Step4FormSection5';
import Step5FormSection5 from './Step5FormSection5';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection5({ formData, handleInputChange, userData}) {
  const [activeStep, setActiveStep] = useState(0);

  // Step labels
  const steps = ['PROPÓSITO y Comentario', 'Matriz de Riesgos - Diseño', 'Matriz de Riesgos - Locaciones', 'Matriz de Riesgos - Desarrollo', 'Matriz de Riesgos - Cierre y Otros'];

  // Navigation handlers
  const handleNext = async () => {
    console.log("Datos del user:", userData);
    const id_usuario = userData?.id || ''; // Asegúrate de que `userData` contiene el id del usuario.
  
    if (!id_usuario) {
      console.error("Error: id_usuario no está definido.");
      return;
    }
  
    console.log("Datos antes de enviar:", formData);
  
    try {
      const response = await axios.post("https://siac-extension-server.vercel.app/saveProgress", {
        id_usuario,
        formData,
        activeStep,
      });
      console.log("Respuesta del servidor al guardar:", response.data);
    } catch (error) {
      console.error("Error al guardar el progreso, pero avanzaremos al siguiente paso:", error);
    }
  
    // Pasar al siguiente paso, incluso si hubo un error al guardar
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  // Render step content based on activeStep
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection5 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection5 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3FormSection5 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4FormSection5 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5FormSection5 formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index} sx={{marginBottom:'20px'}}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Render the current step content */}
      {renderStepContent(activeStep)}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Atrás</Button>
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => console.log('Enviar') : handleNext}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormSection5;

import React, { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import Step1FormSection4 from './Step1FormSection4';
import Step2FormSection4 from './Step2FormSection4';
import Step3FormSection4 from './Step3FormSection4';
import Step4FormSection4 from './Step4FormSection4';
import Step5FormSection4 from './Step5FormSection4';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection4({ formData, handleInputChange, setCurrentSection, userData }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];

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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5FormSection4 formData={formData} handleInputChange={handleInputChange} />;
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => setCurrentSection(5) : handleNext}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormSection4;

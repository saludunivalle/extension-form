import React, { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography } from '@mui/material';
import Step1FormSection3 from './Step1FormSection3';
import Step2FormSection3 from './Step2FormSection3';
import Step3FormSection3 from './Step3FormSection3';
import Step4FormSection3 from './Step4FormSection3';
import Step5FormSection3 from './Step5FormSection3';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection3({ formData, handleInputChange, setCurrentSection, userData }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Aportes Univalle', 'Resumen Financiero', 'Visto Bueno'];

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
        return <Step1FormSection3 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection3 formData={formData} handleNumberInputChange={handleInputChange} totalIngresos={0} totalGastos={0} imprevistos={0} totalGastosImprevistos={0} />;
      case 2:
        return <Step3FormSection3 formData={formData} handleInputChange={handleInputChange} totalAportesUnivalle={0} totalIngresos={0} />;
      case 3:
        return <Step4FormSection3 formData={formData} handleInputChange={handleInputChange} totalRecursos={0} />;
      case 4:
        return <Step5FormSection3 formData={formData} handleInputChange={handleInputChange} />;
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => setCurrentSection(4) : handleNext}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormSection3;

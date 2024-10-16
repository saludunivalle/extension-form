import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography } from '@mui/material';
import Step1 from './Step1'; // Importamos los componentes de cada paso
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection({ formData, handleInputChange, setCurrentSection, escuelas, departamentos, secciones, programas, oficinas, userData }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Datos Generales',
    'Detalles de la Actividad',
    'Certificación y Evaluación',
    'Información Coordinador',
    'Información Adicional',
  ];

  const handleNext = async () => {
    try {
      await axios.post('https://siac-extension-server.vercel.app/saveProgress', {
        id_usuario: userData.id,
        formData: formData,
        activeStep: activeStep,
      });
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    setCurrentSection(3); // Cambia a FormSection3 (Formulario Presupuesto)
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            escuelas={escuelas}
            departamentos={departamentos}
            secciones={secciones}
            programas={programas}
            oficinas={oficinas}
          />
        );
      case 1:
        return <Step2 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5 formData={formData} handleInputChange={handleInputChange} />;
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

export default FormSection;

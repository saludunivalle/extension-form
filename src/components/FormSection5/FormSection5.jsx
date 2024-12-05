import React, { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, CircularProgress, Typography, Modal, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Cambia useHistory por useNavigate
import axios from 'axios';

// Importa las secciones de los pasos
import Step1FormSection5 from './Step1FormSection5';
import Step2FormSection5 from './Step2FormSection5';
import Step3FormSection5 from './Step3FormSection5';
import Step4FormSection5 from './Step4FormSection5';
import Step5FormSection5 from './Step5FormSection5';

function FormSection5({ formData, handleInputChange, userData, currentStep, setCurrentSection}) {
  const [activeStep, setActiveStep] = useState(currentStep);  // Usar currentStep como el paso inicial
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const id_usuario = userData?.id_usuario;
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const location = useLocation(); // Obtener la ubicación actual
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
  const [showModal, setShowModal] = useState(false);

  // Step labels
  const steps = ['Propósito y Comentario', 'Matriz de Riesgos - Diseño', 'Matriz de Riesgos - Locaciones', 'Matriz de Riesgos - Desarrollo', 'Matriz de Riesgos - Cierre y Otros'];

  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  const handleNext = async () => {
    setIsLoading(true); // Iniciar el loading
    const hoja = 3; // Formulario va en SOLICITUDES5

    const completarValoresConNo = (data) => {
        const completado = {};
        for (let key in data) {
            completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
        }
        return completado;
    };

    // Definir los datos específicos según el paso actual
    let pasoData = {};

    switch (activeStep) {
        case 0:
            pasoData = {
                proposito: formData.proposito || 'No',
                comentario: formData.comentario || 'No',
                programa: formData.programa || 'No',
                fecha_solicitud: formData.fecha_solicitud || 'No',
                nombre_solicitante: formData.nombre_solicitante || 'No',
            };
            break;
        case 1:
            pasoData = {
                aplicaDiseno1: formData.aplicaDiseno1 || 'No',
                aplicaDiseno2: formData.aplicaDiseno2 || 'No',
                aplicaDiseno3: formData.aplicaDiseno3 || 'No',
                aplicaDiseno4: formData.aplicaDiseno4 || 'No',
            };
            break;
        case 2:
            pasoData = {
                aplicaLocacion1: formData.aplicaLocacion1 || 'No',
                aplicaLocacion2: formData.aplicaLocacion2 || 'No',
                aplicaLocacion3: formData.aplicaLocacion3 || 'No',
                aplicaLocacion4: formData.aplicaLocacion4 || 'No',
                aplicaLocacion5: formData.aplicaLocacion5 || 'No',
            };
            break;
        case 3:
            pasoData = {
                aplicaDesarrollo1: formData.aplicaDesarrollo1 || 'No',
                aplicaDesarrollo2: formData.aplicaDesarrollo2 || 'No',
                aplicaDesarrollo3: formData.aplicaDesarrollo3 || 'No',
                aplicaDesarrollo4: formData.aplicaDesarrollo4 || 'No',
                aplicaDesarrollo5: formData.aplicaDesarrollo5 || 'No',
                aplicaDesarrollo6: formData.aplicaDesarrollo6 || 'No',
                aplicaDesarrollo7: formData.aplicaDesarrollo7 || 'No',
                aplicaDesarrollo8: formData.aplicaDesarrollo8 || 'No',
                aplicaDesarrollo9: formData.aplicaDesarrollo9 || 'No',
                aplicaDesarrollo10: formData.aplicaDesarrollo10 || 'No',
                aplicaDesarrollo11: formData.aplicaDesarrollo11 || 'No',
            };
            break;
        case 4:
            pasoData = {
                aplicaCierre1: formData.aplicaCierre1 || 'No',
                aplicaCierre2: formData.aplicaCierre2 || 'No',
                aplicaCierre3: formData.aplicaCierre3 || 'No',
            };
            break;
        default:
            break;
    }

    const pasoDataCompleto = completarValoresConNo(pasoData);

    try {
        await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
            id_solicitud: idSolicitud,
            ...pasoDataCompleto, // Desestructurar pasoDataCompleto para que cada campo sea una clave separada
            paso: activeStep + 1,
            hoja,
            id_usuario: userData.id_usuario, // Asegurar que se pase directamente id_usuario
            name: userData.name,
        });

        // Mover al siguiente paso
        setIsLoading(false); // Iniciar el loading
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
        console.error('Error al guardar el progreso:', error.response?.data || error.message);
    }
};

  const handleSubmit = async () => {
    setIsLoading(true); // Iniciar el loading

    const hoja = 4; // Cambia este valor según la hoja a la que corresponda el formulario
    
    const completarValoresConNo = (data) => {
      const completado = {};
      for (let key in data) {
        completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
      }
      return completado;
    };

    const pasoData = {
      aplicaCierre1: formData.aplicaCierre1,
      aplicaCierre2: formData.aplicaCierre2,
      aplicaCierre3: formData.aplicaCierre3,
    };

    const pasoDataCompleto = completarValoresConNo(pasoData);

    try {
      // Guardar los datos del último paso en Google Sheets
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoDataCompleto,
        paso: 5,
        hoja,
        userData: {
          id_usuario,
          name: userData.name,
        }
      });

      // Abrir el modal de confirmación
      setIsLoading(false); // Iniciar el loading

      setOpenModal(true);
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1); // Reducir el paso en 1
  };

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

      {/* Render the current step content */}
      {renderStepContent(activeStep)}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Atrás</Button>
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => setShowModal(true) : handleNext} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null} >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>Formulario Riesgos Potenciales</DialogTitle>
          <DialogContent>
            <DialogContentText>
             Los datos del Formulario Riesgos Potenciales han sido guardados, ¿Desea continuar con el siguiente formulario?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCurrentSection(4)} color="primary">
              Continuar
            </Button>
            <Button onClick={() => window.location.href = '/'} color="secondary">
              Salir
            </Button>
          </DialogActions>
        </Dialog>

    </Box>
  );
}

export default FormSection5;

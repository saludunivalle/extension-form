import React, { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, Modal } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Cambia useHistory por useNavigate
import axios from 'axios';

// Importa las secciones de los pasos
import Step1FormSection5 from './Step1FormSection5';
import Step2FormSection5 from './Step2FormSection5';
import Step3FormSection5 from './Step3FormSection5';
import Step4FormSection5 from './Step4FormSection5';
import Step5FormSection5 from './Step5FormSection5';

function FormSection5({ formData, handleInputChange, userData, currentStep }) {
  const [activeStep, setActiveStep] = useState(currentStep);  // Usar currentStep como el paso inicial
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const id_usuario = userData?.id_usuario;
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const location = useLocation(); // Obtener la ubicación actual



  // Step labels
  const steps = ['PROPÓSITO y Comentario', 'Matriz de Riesgos - Diseño', 'Matriz de Riesgos - Locaciones', 'Matriz de Riesgos - Desarrollo', 'Matriz de Riesgos - Cierre y Otros'];

  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  // useEffect(() => {
  //   // Al cargar el componente, revisamos si hay parámetros en la URL (como el paso)
  //   const searchParams = new URLSearchParams(location.search);
  //   const paso = parseInt(searchParams.get('paso')) || 0; // Si no hay paso, iniciar en 0
  //   setActiveStep(paso); // Establecemos el paso actual
  // }, [location.search]);

  // Obtener el último ID (inicial)
  // useEffect(() => {
  //   const obtenerUltimoId = async () => {
  //     try {
  //       const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
  //         params: { sheetName: 'SOLICITUDES5' }, // Cambia 'SOLICITUDES5' según la hoja en la que estés trabajando
  //       });
  //       const nuevoId = response.data.lastId + 1;
  //       setIdSolicitud(nuevoId); // Establece el nuevo id_solicitud
  //     } catch (error) {
  //       console.error('Error al obtener el último ID:', error);
  //     }
  //   };

  //   if (!idSolicitud) {
  //     obtenerUltimoId();
  //   }
  // }, [idSolicitud]);

  const handleNext = async () => {
    const hoja = 5; // Formulario va en SOLICITUDES5

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
          proposito: formData.proposito,
          comentario: formData.comentario,
          programa: formData.programa,
          fecha: formData.fecha,
          elaboradoPor: formData.elaboradoPor,
        };
        break;
      case 1:
        pasoData = {
          aplicaDiseno1: formData.aplicaDiseno1,
          aplicaDiseno2: formData.aplicaDiseno2,
          aplicaDiseno3: formData.aplicaDiseno3,
          aplicaDiseno4: formData.aplicaDiseno4,
        };
        break;
      case 2:
        pasoData = {
          aplicaLocacion1: formData.aplicaLocacion1,
          aplicaLocacion2: formData.aplicaLocacion2,
          aplicaLocacion3: formData.aplicaLocacion3,
          aplicaLocacion4: formData.aplicaLocacion4,
          aplicaLocacion5: formData.aplicaLocacion5,
        };
        break;
      case 3:
        pasoData = {
          aplicaDesarrollo1: formData.aplicaDesarrollo1,
          aplicaDesarrollo2: formData.aplicaDesarrollo2,
          aplicaDesarrollo3: formData.aplicaDesarrollo3,
          aplicaDesarrollo4: formData.aplicaDesarrollo4,
          aplicaDesarrollo5: formData.aplicaDesarrollo5,
          aplicaDesarrollo6: formData.aplicaDesarrollo6,
          aplicaDesarrollo7: formData.aplicaDesarrollo7,
          aplicaDesarrollo8: formData.aplicaDesarrollo8,
          aplicaDesarrollo9: formData.aplicaDesarrollo9,
          aplicaDesarrollo10: formData.aplicaDesarrollo10,
          aplicaDesarrollo11: formData.aplicaDesarrollo11,
        };
        break;
      case 4:
        pasoData = {
          aplicaCierre1: formData.aplicaCierre1,
          aplicaCierre2: formData.aplicaCierre2,
          aplicaCierre3: formData.aplicaCierre3,
        };
        break;
      default:
        break;
    }

    const pasoDataCompleto = completarValoresConNo(pasoData);

    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoDataCompleto,
        paso: activeStep + 1,
        hoja,
        userData: {
          id_usuario,
          name: userData.name,
        }
      });

      // Mover al siguiente paso
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };

  const handleSubmit = async () => {
    const hoja = 5; // Cambia este valor según la hoja a la que corresponda el formulario
    
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
      setOpenModal(true);
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1); // Reducir el paso en 1
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Cerrar el modal
    navigate('/');   // Usamos navigate en lugar de history.push('/')
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>

      {/* Modal for confirmation */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Box sx={{ backgroundColor: 'white', padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Se ha enviado todos los formularios con éxito</Typography>
            <Button variant="contained" onClick={handleCloseModal} sx={{ marginTop: '10px' }}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default FormSection5;

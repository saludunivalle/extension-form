import { useState, useEffect } from 'react';
import { Box, Button, Stepper, Step, StepLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Cambia useHistory por useNavigate
import axios from 'axios';
import { openFormReport, downloadFormReport } from '../../services/reportServices';
import useInternalNavigationGoogleSheets from '../../hooks/useInternalNavigationGoogleSheets';
import PrintIcon from '@mui/icons-material/Print';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Importa las secciones de los pasos
import Step1FormSection3 from './Step1FormSection3';
import Step2FormSection3 from './Step2FormSection3';
import Step3FormSection3 from './Step3FormSection3';
import Step4FormSection3 from './Step4FormSection3';
import Step5FormSection3 from './Step5FormSection3';
import Step6FormSection3 from './Step6FormSection3'; 

import CheckIcon from '@mui/icons-material/Check'; // Importa el ícono del check
import { styled } from '@mui/system';

/* 
Este componente se encarga de cambiar el color de fondo, el color del texto y otros estilos visuales del ícono:
- Si el paso está completado (`completed`), el fondo es azul oscuro y el texto blanco.
- Si el paso está activo (`active`), el fondo también es azul oscuro y el texto blanco. (Sin embargo con el otro componente se le añade el icono check)
- Si el paso está pendiente, el fondo es gris claro y el texto gris oscuro.
*/
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%', 
  backgroundColor: 
    ownerState.active
    ? '#0056b3' // Activo: azul oscuro (donde estoy parado) 
    : ownerState.completed
    ? '#81bef7' // Completado no activo: azul claro (completado pero no estoy parado ahí)
    : ownerState.accessible
    ? '#81bef7' // Accesible pero no completado: azul más claro
    : '#E0E0E0', // No accesible: gris
  color: ownerState.completed || ownerState.active || ownerState.accessible ? '#FFFFFF' : '#4F4F4F', 
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: ownerState.accessible || ownerState.completed ? 'scale(1.05)' : 'none',
    boxShadow: ownerState.accessible || ownerState.completed ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
  }
}));

/*
Este componente se encarga de renderizar el contenido del ícono.
- Si el paso está completado (`completed`), muestra un ícono de verificación (`CheckIcon`).
- Si el paso no está completado, muestra el ícono correspondiente al paso (`icon`).
*/
const CustomStepIcon = ({ active, completed, icon, accessible }) => (
  <CustomStepIconRoot ownerState={{ active, completed, accessible }}>
    {completed ? <CheckIcon /> : icon}
  </CustomStepIconRoot>
);

function FormSection3({ formData, handleInputChange, userData, currentStep, setCurrentSection, formId}) {
  // Step labels - Actualizado para incluir el nuevo paso
  const steps = ['Propósito y Comentario', 'Matriz de Riesgos - Diseño', 'Matriz de Riesgos - Locaciones', 'Matriz de Riesgos - Desarrollo', 'Matriz de Riesgos - Cierre', 'Matriz de Riesgos - Otros'];
  const [activeStep, setActiveStep] = useState(currentStep);  // Usar currentStep como el paso inicial
  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
  const id_usuario = userData?.id_usuario;
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const location = useLocation(); // Obtener la ubicación actual
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0); // Máximo paso alcanzado
  const [estadoFormularios, setEstadoFormularios] = useState({
    "1": "En progreso",
    "2": "En progreso",
    "3": "En progreso", 
    "4": "En progreso"
  });

  const [idSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  const { maxAllowedStep, loading: navLoading, error: navError, isStepAllowed } = 
  useInternalNavigationGoogleSheets(idSolicitud, 3, steps.length);
 
  const [errors, setErrors] = useState({
    aplicaDiseno1: 'No',
    aplicaDiseno2: 'No',
    aplicaDiseno3: 'No',
    aplicaDiseno4: 'No',
  });

  // --- PERSISTENCIA DE DATOS EN LOCALSTORAGE ---
  // Cargar datos guardados al iniciar
  useEffect(() => {
    if (!idSolicitud) return;
    const savedFormData = localStorage.getItem(`solicitud3_data_${idSolicitud}`);
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // Llamar a handleInputChange para cada campo guardado
        Object.entries(parsed).forEach(([key, value]) => {
          if (formData[key] !== value) {
            handleInputChange({ target: { name: key, value } });
          }
        });
      } catch (e) {
        console.error('Error al parsear datos guardados de Formulario 3:', e);
      }
    }
  }, [idSolicitud]);

  // Guardar datos cada vez que cambian
  useEffect(() => {
    if (!idSolicitud) return;
    if (formData && Object.keys(formData).length > 0) {
      try {
        localStorage.setItem(`solicitud3_data_${idSolicitud}`, JSON.stringify(formData));
      } catch (e) {
        console.error('Error al guardar datos de Formulario 3 en localStorage:', e);
      }
    }
  }, [formData, idSolicitud]);

  // Modificar la función validateStep para incluir validación en el primer paso
const validateStep = () => {
  const stepErrors = {};

  if (activeStep === 0) { // Validación para el primer paso
    // Validar campos obligatorios del paso 1
    const requiredFields = [
      'proposito',
      'comentario',
      'programa'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        stepErrors[field] = "Este campo es obligatorio";
      }
    });
    
    // Mostrar mensaje de error en UI si hay campos obligatorios vacíos
    if (Object.keys(stepErrors).length > 0) {
      alert("Por favor complete todos los campos obligatorios marcados con *");
    }
  }
  else if (activeStep === 1) { // Validación para el segundo paso (diseño)
    /* No son obligatorios
    const requiredFields = [
      'aplicaDiseno1',
      'aplicaDiseno2',
      'aplicaDiseno3',
      'aplicaDiseno4'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || 
         (formData[field] !== 'Sí' && formData[field] !== 'No')) {
        stepErrors[field] = "Debe seleccionar una opción";
      }
    });
    */
  }

  setErrors(stepErrors);
  return Object.keys(stepErrors).length === 0;
};


  useEffect(() => {
    if (!idSolicitud) {
      alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      navigate('/');
    }
  }, [idSolicitud]);
  
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      setActiveStep(0); // Reiniciar al paso 0 si el valor es inválido
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (!navLoading && maxAllowedStep !== undefined) {
      console.log('maxAllowedStep:', maxAllowedStep);
      console.log('activeStep:', activeStep);
      console.log('isStepAllowed para siguiente paso:', isStepAllowed(activeStep + 1));
      
      // Actualiza el paso más alto alcanzado según lo que permite el servidor
      setHighestStepReached(prev => {
        // Si el formulario está marcado como completado, permitir todos los pasos
        if (estadoFormularios && estadoFormularios["3"] === "Completado") {
          return steps.length - 1;
        }
        return Math.max(prev, maxAllowedStep, activeStep); // Incluir activeStep actual
      });
    }
  }, [maxAllowedStep, navLoading, activeStep, isStepAllowed, estadoFormularios]);

  useEffect(() => {
    const checkFormCompletionStatus = async () => {
      if (!idSolicitud) return;
      
      try {
        const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
          id_solicitud: idSolicitud,
          etapa_destino: 3,
          paso_destino: 6
        });
        
        if (response.data.success && response.data.estado) {
          const { estado } = response.data;
          
          // Actualizar el estado de los formularios con lo que viene del backend
          if (estado.estadoFormularios) {
            setEstadoFormularios(estado.estadoFormularios);
          }
          
          // Si el formulario 3 está completado, actualizar UI para reflejarlo
          if (estado.estadoFormularios["3"] === "Completado") {
            // Marcar todos los pasos como completados
            const allSteps = Array.from({ length: steps.length }, (_, i) => i);
            setCompletedSteps(allSteps);
            setHighestStepReached(steps.length - 1);
          }
          
          // Si estamos en el paso 6, marcar los pasos anteriores como completados
          if (estado.etapaActual === 3 && estado.pasoActual >= 6) {
            // Marcar pasos 0-4 como completados
            const completedStepsArray = Array.from({ length: 5 }, (_, i) => i);
            setCompletedSteps(prev => {
              const newCompleted = [...prev];
              completedStepsArray.forEach(step => {
                if (!newCompleted.includes(step)) {
                  newCompleted.push(step);
                }
              });
              return newCompleted;
            });
            
            // Permitir acceso al paso 5 (último paso en UI)
            setHighestStepReached(prev => Math.max(prev, 5));
          }
        }
      } catch (error) {
        console.error('Error al verificar estado de completado:', error);
      }
    };
    
    checkFormCompletionStatus();
  }, [idSolicitud, steps.length]);

  /*
    Lógica del botón "Siguiente"
    - Valida los campos del paso actual. Si hay errores, detiene el avance.
    - Construye los datos necesarios (`pasoData`) según el paso activo, incluyendo archivos si aplica.
    - Envía los datos al servidor usando `axios` y maneja errores de la solicitud.
    - Si el envío es exitoso, marca el paso como completado, avanza al siguiente y actualiza el estado del progreso.
  */
  
  const handleNext = async () => {
    if (!validateStep()) {
      console.log("Errores en los campos: ", errors); 
      return; 
    }
    if (activeStep < steps.length - 1) {
      setIsLoading(true); // Iniciar el loading
      const hoja = 3;

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
          setCompletedSteps((prevCompleted) => {
            const newCompleted = [...prevCompleted];
            if (!newCompleted.includes(activeStep)) {
              newCompleted.push(activeStep);
            }
            return newCompleted;
          });                  
        
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setHighestStepReached((prev) => Math.max(prev, activeStep + 1, maxAllowedStep));
      } catch (error) {
          console.error('Error al guardar el progreso:', error.response?.data || error.message);
      }
    }
};

// Modificado para manejar tanto el paso 4 (Cierre) como el paso 5 (Otros)
const handleSubmit = async () => {
  // Validar campos si es necesario
  if (!validateStep()) {
    console.log("Errores en los campos: ", errors); 
    return; 
  }

  setIsLoading(true); // Iniciar el loading

  // Si estamos en el paso 4 (Cierre)
  if (activeStep === 4) {
    const hoja = 3;
    
    const completarValoresConNo = (data) => {
      const completado = {};
      for (let key in data) {
        completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
      }
      return completado;
    };

    const pasoData = {
      aplicaCierre1: formData.aplicaCierre1 || 'No',
      aplicaCierre2: formData.aplicaCierre2 || 'No',
      aplicaCierre3: formData.aplicaCierre3 || 'No',
    };

    const pasoDataCompleto = completarValoresConNo(pasoData);

    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        ...pasoDataCompleto,
        paso: 5,
        hoja,
        id_usuario,
        name: userData.name,
      });

      // Marcar el paso 4 como completado
      setCompletedSteps(prev => {
        const newCompleted = [...prev];
        if (!newCompleted.includes(activeStep)) {
          newCompleted.push(activeStep);
        }
        return newCompleted;
      });

      // Avanzar al paso 6 después de guardar
      setActiveStep(5);
      setIsLoading(false);
      setHighestStepReached((prev) => Math.max(prev, 5, maxAllowedStep));
      
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      setIsLoading(false);
    }
  } 
  // Si estamos en el paso 5 (Otros - también known como paso 6 en la UI)
  else if (activeStep === 5) {
    try {
      // Marcar la etapa como completada
      const response = await axios.post('https://siac-extension-server.vercel.app/actualizacion-progreso', {
        id_solicitud: idSolicitud,
        etapa_actual: 3,
        paso_actual: 6, // Paso 6 completado
        estado_formularios: {
          "1": "Completado",
          "2": "Completado", 
          "3": "Completado", // Marcar formulario 3 como completado
          "4": "En progreso"
        }
      });

      // IMPORTANTE: Actualizar explícitamente los pasos completados para incluir el paso 5 (último paso en UI)
      setCompletedSteps(prev => {
        const newCompleted = [...prev];
        if (!newCompleted.includes(activeStep)) {
          newCompleted.push(activeStep);
        }
        return newCompleted;
      });

      // IMPORTANTE: Actualizar highestStepReached para incluir el último paso
      setHighestStepReached(steps.length - 1);

      // Mostrar el modal de éxito
      setShowModal(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
      setIsLoading(false);
    }
  }
};
  
  // Lógica del botón "Atrás"
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  /*
    - Devuelve el componente correspondiente al paso actual en la sección 3 del formulario.
    - Cada caso del `switch` renderiza un componente de paso específico (`Step1FormSection3`, `Step2FormSection3`, etc.) con las props necesarias, como datos del formulario y manejadores de eventos.
    - Retorna `null` si el paso no coincide con los definidos.
  */
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection3 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors}
          idSolicitud={idSolicitud}
          userData={userData}
        />;
      case 1:
        return <Step2FormSection3 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
          idSolicitud={idSolicitud}
          userData={userData}
        />;
      case 2:
        return <Step3FormSection3 
          formData={formData} 
          handleInputChange={handleInputChange}
          idSolicitud={idSolicitud}
          userData={userData} 
        />;
      case 3:
        return <Step4FormSection3 
          formData={formData} 
          handleInputChange={handleInputChange}
          idSolicitud={idSolicitud}
          userData={userData}
        />;
      case 4:
        return <Step5FormSection3 
          formData={formData} 
          handleInputChange={handleInputChange} 
          idSolicitud={idSolicitud}
          userData={userData}
          setIsLoading={setIsLoading}
          navigate={navigate}
          setCurrentSection={setCurrentSection}
        />;
      case 5:
        return <Step6FormSection3 
          idSolicitud={idSolicitud}
          userData={userData}
        />;
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
    }
  };

  // Modificar la función PrintReportButton en todos los componentes de formulario

const PrintReportButton = () => {
  // Verificar el estado del formulario con el backend
  const [isFormCompletedBackend, setIsFormCompletedBackend] = useState(false);
  
  useEffect(() => {
    const checkFormCompletion = async () => {
      if (!idSolicitud) return;
      
      try {
        const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
          id_solicitud: idSolicitud,
          etapa_destino: formId || 3,
          paso_destino: 6 // Explícitamente verificar el paso 6
        });
        
        if (response.data.success && response.data.estado?.estadoFormularios) {
          // Comprobar si este formulario está marcado como "Completado"
          const formStatus = response.data.estado.estadoFormularios[formId.toString()];
          setIsFormCompletedBackend(formStatus === 'Completado');
          
          // Verificar si estamos en el paso 6 y se ha completado
          const isPaso6Completed = response.data.estado.etapaActual === 3 && 
                                 response.data.estado.pasoActual >= 6;
          
          if (isPaso6Completed) {
            // Actualizar completedSteps para incluir el paso 5 (último en UI)
            setCompletedSteps(prev => {
              if (!prev.includes(5)) { // El paso 6 es índice 5 en la UI
                return [...prev, 5];
              }
              return prev;
            });
          }
          
          console.log(`Estado del formulario ${formId} según backend: ${formStatus}`);
          console.log(`Paso 6 completado: ${isPaso6Completed}`);
        }
      } catch (error) {
        console.error('Error al verificar estado del formulario:', error);
      }
    };
    
    checkFormCompletion();
  }, [idSolicitud]);
  
  // MODIFICACIÓN: Ahora verificamos específicamente si el paso 6 está completado
  const isLastStepCompleted = (
    // Estamos exactamente en el último paso
    activeStep === steps.length - 1 && 
    // El paso está marcado como completado
    completedSteps.includes(steps.length - 1) &&
    // El servidor ha registrado la finalización del último paso
    maxAllowedStep >= steps.length - 1
  );
  
  const isButtonEnabled = isFormCompletedBackend || isLastStepCompleted || 
                        // Incluir el caso donde estamos en el último paso y está en completedSteps
                        (activeStep === steps.length - 1 && completedSteps.includes(activeStep));
  
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      await downloadFormReport(idSolicitud, formId);
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Hubo un problema al generar el reporte');
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: '-60px', 
      right: '10px', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '-20px',
      marginRight: '70px',
    }}>
      {navLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      <Tooltip title={isButtonEnabled ? "Generar reporte" : "Complete todos los pasos y envíe el formulario para generar el reporte"}>
        <span>
          <IconButton 
            color="primary" 
            onClick={handleGenerateReport}
            disabled={!isButtonEnabled || isGeneratingReport}
            size="large"
          >
            {isGeneratingReport ? 
              <CircularProgress size={24} color="inherit" /> : 
              <PrintIcon />
            }
          </IconButton>
        </span>
      </Tooltip>
      <Typography 
        variant="caption" 
        color="primary" 
        sx={{ 
          fontSize: '10px', 
          fontWeight: 'bold',
          marginBottom: '10px',
          marginTop: '-10px',
          opacity: !isButtonEnabled || isGeneratingReport ? 0.5 : 1 
        }}
      >
        {isGeneratingReport ? 'Generando...' : 'Generar reporte'}
      </Typography>
    </Box>
  );
};
  
  return (
    <Box sx={{ position: 'relative' }}>
      <PrintReportButton />
      <Stepper
        activeStep={activeStep}
        sx={{
          '& .MuiStepLabel-root': { cursor: 'default' },
          '& .MuiStepLabel-root.Mui-completed': { cursor: 'pointer' },
          '& .MuiStepLabel-root.Mui-active': { cursor: 'pointer' },
        }}
      >
        {steps.map((label, index) => (
          <Step key={index} sx={{marginBottom: '20px'}}>
            <StepLabel
              onClick={() => handleStepClick(index)}
              StepIconComponent={(props) => (
                <CustomStepIcon 
                  {...props} 
                  active={index === activeStep}
                  completed={completedSteps.includes(index)}
                  accessible={index <= highestStepReached}
                />
              )}
              sx={{
                '& .MuiStepLabel-label': {
                  backgroundColor: index === activeStep
                    ? '#0056b3' // Activo: azul oscuro
                    : completedSteps.includes(index)
                      ? '#81bef7' // Completado no activo: azul claro
                      : index <= highestStepReached
                        ? '#81bef7' // Accesible no completado: azul claro
                        : 'transparent', // No accesible: sin fondo
                  color: index === activeStep || index <= highestStepReached 
                    ? '#FFFFFF' 
                    : '#A0A0A0',
                  padding: index <= highestStepReached ? '5px 10px' : '0',
                  borderRadius: '20px',
                  fontWeight: index === activeStep ? 'bold' : 'normal',
                  cursor: index <= highestStepReached ? 'pointer' : 'default',
                  opacity: index <= highestStepReached ? 1 : 0.6,
                },
                '& .MuiStepIcon-root': {
                  color: index === activeStep
                    ? '#0056b3' // Activo: azul oscuro
                    : completedSteps.includes(index)
                      ? '#81bef7' // Completado no activo: azul claro
                      : index <= highestStepReached
                        ? '#E0E0E0' // Accesible no completado: azul claro
                        : '#E0E0E0', // No accesible: gris
                  fontSize: '28px',
                },
                '& .MuiStepIcon-root.Mui-active': { color: '#0056b3' },
                '& .MuiStepIcon-text': { fill: '#FFFFFF' },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep, errors)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Atrás</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: '320px',
            maxWidth: '800px',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #f0f0f0', 
          pb: 2,
          backgroundColor: '#f9f9f9',
          display: 'flex',
          alignItems: 'center'
        }}>
          <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
          Formulario Completado
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Los datos del formulario han sido guardados correctamente. ¿Qué desea hacer a continuación?
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          p: 2,
          borderTop: '0px', // Quita la línea divisoria
          gap: 2, // Aumenta el espaciado entre botones
        }}>
          <Button 
            onClick={() => window.location.href = '/'} 
            color="secondary" 
            variant="outlined"
            sx={{ 
              minWidth: '150px', // Ancho fijo para todos los botones
              height: '40px'     // Altura fija para todos los botones
            }}
          >
            Volver al Inicio
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}> {/* Mayor espacio entre botones */}
            <Button 
              onClick={() => setCurrentSection(4)} 
              color="primary" 
              variant="outlined"
              sx={{ 
                minWidth: '150px', 
                height: '40px' 
              }}
              startIcon={<NavigateNextIcon />} // Añadir icono para consistencia
            >
              Siguiente Formulario
            </Button>
            <Button 
              onClick={async () => {
                try {
                  setIsGeneratingReport(true);
                  const idSolicitud = localStorage.getItem('id_solicitud');
                  await downloadFormReport(idSolicitud, 3);
                  setCurrentSection(4);
                } catch (error) {
                  console.error('Error al generar el reporte:', error);
                  alert('Hubo un problema al generar el reporte');
                } finally {
                  setIsGeneratingReport(false);
                }
              }} 
              color="primary" 
              variant="contained"
              sx={{ 
                minWidth: '150px', 
                height: '40px' 
              }}
              startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
            >
              {isGeneratingReport ? 'Generando...' : 'Generar y Avanzar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

FormSection3.propTypes = {
  formData: PropTypes.shape({
    proposito: PropTypes.string,
    comentario: PropTypes.string,
    programa: PropTypes.string,
    fecha_solicitud: PropTypes.string,
    nombre_solicitante: PropTypes.string,
    aplicaDiseno1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDiseno2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDiseno3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDiseno4: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion4: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion5: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo4: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo5: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo6: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo7: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo8: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo9: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo10: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo11: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  currentStep: PropTypes.number.isRequired,
  setCurrentSection: PropTypes.func.isRequired,
};

export default FormSection3;

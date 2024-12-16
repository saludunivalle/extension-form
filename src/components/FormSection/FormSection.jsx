  import React, { useEffect, useState } from 'react';
  import { Stepper, Step, StepLabel, Button, Box, CircularProgress } from '@mui/material';
  import Step1 from './Step1'; // Importamos los componentes de cada paso
  import Step2 from './Step2';
  import Step3 from './Step3';
  import Step4 from './Step4';
  import Step5 from './Step5';
  import axios from 'axios';
  import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
  import { useNavigate } from 'react-router-dom';
  import CheckIcon from '@mui/icons-material/Check'; // Importa el ícono del check
  import { styled } from '@mui/system';

  const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%', // Hacerlo redondo
    backgroundColor: ownerState.completed
      ? '#0056b3' // Fondo azul para pasos completados
      : ownerState.active
      ? '#0056b3' // Fondo azul para el paso activo
      : '#E0E0E0', // Fondo gris para los pasos inactivos
    color: ownerState.completed || ownerState.active ? '#FFFFFF' : '#4F4F4F', // Texto blanco si es activo/completado
    fontWeight: 'bold',
  }));
  
  // Componente del ícono del paso
  const CustomStepIcon = ({ active, completed, icon }) => (
    <CustomStepIconRoot ownerState={{ active, completed }}>
      {completed ? <CheckIcon /> : icon}
    </CustomStepIconRoot>
  );
  
  function FormSection({ 
    formData, 
    handleInputChange, 
    setCurrentSection, 
    escuelas, 
    departamentos, 
    secciones, 
    programas, 
    oficinas, 
    userData, 
    currentStep,
    handleFileChange,
  }) {
    const [activeStep, setActiveStep] = useState(currentStep); // Usar currentStep como el paso inicial
    const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usar id_solicitud desde el localStorage
    const [showModal, setShowModal] = useState(false); // Estado para el modal de finalización
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
    const navigate = useNavigate();
    const [completedSteps, setCompletedSteps] = useState([]);
    const [highestStepReached, setHighestStepReached] = useState(0); // Máximo paso alcanzado

    useEffect(() => {
      if (!idSolicitud) {
        alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
        navigate('/');
      }
    }, [idSolicitud, navigate]);

    const steps = [
      'Datos Generales',
      'Detalles de la Actividad',
      'Certificación y Evaluación',
      'Información Coordinador',
      'Información Adicional',
    ];
    
    useEffect(() => {
      if (activeStep < 0 || activeStep >= steps.length) {
        console.warn('Paso fuera de rango. Reiniciando a 0.');
        setActiveStep(0);
      }
    }, [activeStep, steps.length]);
    
    useEffect(() => {
      if (currentStep < 0 || currentStep >= steps.length) {
        setActiveStep(0); // Reiniciar al paso 0 si el valor es inválido
      } else {
        setActiveStep(currentStep);
      }
    }, [currentStep, steps.length]);

    
    const handleNext = async () => {
      if (activeStep < steps.length - 1) {
        setIsLoading(true); // Iniciar el loading
        const hoja = 1; // Cambiar según corresponda al formulario actual
        let pasoData = {};

        // Configurar los datos según el paso actual
        switch (activeStep) {
            case 0:
                pasoData = {
                    id_solicitud: idSolicitud,
                    fecha_solicitud: formData.fecha_solicitud || 'N/A',
                    nombre_actividad: formData.nombre_actividad || 'N/A',
                    nombre_solicitante: formData.nombre_solicitante || 'N/A',
                    dependencia_tipo: formData.dependencia_tipo || 'N/A',
                    nombre_escuela: formData.nombre_escuela || 'N/A',
                    nombre_departamento: formData.nombre_departamento || 'N/A',
                    nombre_seccion: formData.nombre_seccion || 'N/A',
                    nombre_dependencia: formData.nombre_dependencia || 'N/A',
                };
                break;
            case 1:
                pasoData = {
                    introduccion: formData.introduccion || 'N/A',
                    objetivo_general: formData.objetivo_general || 'N/A',
                    objetivos_especificos: formData.objetivos_especificos || 'N/A',
                    justificacion: formData.justificacion || 'N/A',
                    metodologia: formData.metodologia || 'N/A',
                };
                break;
            case 2:
                pasoData = {
                    tipo: formData.tipo || 'N/A',
                    otro_tipo: formData.otro_tipo || 'N/A',
                    modalidad: formData.modalidad || 'N/A',
                    horas_trabajo_presencial: formData.horas_trabajo_presencial || 'N/A',
                    horas_sincronicas: formData.horas_sincronicas || 'N/A',
                    total_horas: formData.total_horas || 'N/A',
                    programCont: formData.programCont || 'N/A',
                    dirigidoa: formData.dirigidoa || 'N/A',
                    creditos: formData.creditos || 'N/A',
                    cupo_min: formData.cupo_min || 'N/A',
                    cupo_max: formData.cupo_max || 'N/A',
                };
                break;
            case 3:
                pasoData = {
                    nombre_coordinador: formData.nombre_coordinador || 'N/A',
                    correo_coordinador: formData.correo_coordinador || 'N/A',
                    tel_coordinador: formData.tel_coordinador || 'N/A',
                    perfil_competencia: formData.perfil_competencia || 'N/A',
                    formas_evaluacion: formData.formas_evaluacion || 'N/A',
                    certificado_solicitado: formData.certificado_solicitado || 'N/A',
                    calificacion_minima: formData.calificacion_minima || 'N/A',
                    razon_no_certificado: formData.razon_no_certificado || 'N/A',
                    valor_inscripcion: formData.valor_inscripcion || 'N/A',
                };
                break;
            case 4:
                pasoData = {
                    becas_convenio: formData.becas_convenio || 'N/A',
                    becas_estudiantes: formData.becas_estudiantes || 'N/A',
                    becas_docentes: formData.becas_docentes || 'N/A',
                    becas_egresados: formData.becas_egresados || 'N/A',
                    becas_funcionarios: formData.becas_funcionarios || 'N/A',
                    becas_otros: formData.becas_otros || 'N/A',
                    periodicidad_oferta: formData.periodicidad_oferta || 'N/A',
                    organizacion_actividad: formData.organizacion_actividad || 'N/A',
                    otro_tipo_act: formData.otro_tipo_act || 'N/A',
                    extension_solidaria: formData.extension_solidaria || 'N/A',
                    costo_extension_solidaria: formData.costo_extension_solidaria || 'N/A',
                    personal_externo: formData.personal_externo || 'N/A',
                };
                break;
            default:
                break;
        }

        // Crear el objeto de datos a enviar
        let dataToSend;

        // Solo en el último paso se incluirá la pieza gráfica
        if (formData.pieza_grafica && activeStep === 4) {
            dataToSend = new FormData();
            dataToSend.append('id_solicitud', idSolicitud);
            dataToSend.append('paso', activeStep + 1);
            dataToSend.append('hoja', hoja);
            dataToSend.append('id_usuario', userData.id);
            dataToSend.append('name', userData.name);

            // Añadir los campos de pasoData al FormData
            Object.keys(pasoData).forEach((key) => {
                dataToSend.append(key, pasoData[key]);
            });

            // Añadir pieza gráfica
            dataToSend.append('pieza_grafica', formData.pieza_grafica);
        } else {
            // Si no hay pieza gráfica o no es el último paso, envía los datos como JSON
            dataToSend = {
                id_solicitud: idSolicitud,
                paso: activeStep + 1,
                hoja: hoja,
                id_usuario: userData.id,
                name: userData.name,
                ...pasoData,
            };
        }

        try {
            // Debugging para asegurar los datos enviados
            console.log("Enviando Datos:", dataToSend);

            if (formData.pieza_grafica && activeStep === 4) {
                await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                try {
                  await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend);
                  setCompletedSteps((prev) => [...prev, activeStep]);
                } catch (error) {
                  console.error('Error al guardar el progreso:', error);
                  alert('Hubo un problema al guardar los datos. Por favor, inténtalo de nuevo.');
                } finally {
                  setIsLoading(false);
                }
            }

            // Mover al siguiente paso si todo fue exitoso
            setIsLoading(false); // Finalizar el loading
            setCompletedSteps((prevCompleted) => {
              const newCompleted = [...prevCompleted];
              if (!newCompleted.includes(activeStep)) {
                newCompleted.push(activeStep);
              }
              return newCompleted;
            });                  
          
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setHighestStepReached((prev) => Math.max(prev, activeStep + 1));
        } catch (error) {
            console.error('Error al guardar el progreso:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
            }
        }
      }
    };

    const handleBack = () => {
      if (activeStep > 0) {
        setActiveStep((prev) => prev - 1);
      }
    };

    const handleStepClick = (stepIndex) => {
      if (stepIndex <= highestStepReached) {
        setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
      }
    };

    const handleSubmit = async () => {
      setIsLoading(true); // Finalizar el loading
      const hoja = 1;

      let pasoData = {
          becas_convenio: formData.becas_convenio || 'N/A',
          becas_estudiantes: formData.becas_estudiantes || 'N/A',
          becas_docentes: formData.becas_docentes || 'N/A',
          becas_egresados: formData.becas_egresados || 'N/A',
          becas_funcionarios: formData.becas_funcionarios || 'N/A',
          becas_otros: formData.becas_otros || 'N/A',
          periodicidad_oferta: formData.periodicidad_oferta || 'N/A',
          organizacion_actividad: formData.organizacion_actividad || 'N/A',
          otro_tipo_act: formData.otro_tipo_act || 'N/A',
          extension_solidaria: formData.extension_solidaria || 'N/A',
          costo_extension_solidaria: formData.costo_extension_solidaria || 'N/A',
          personal_externo: formData.personal_externo || 'N/A',
      };

      let dataToSend = new FormData();
      dataToSend.append('id_solicitud', idSolicitud);
      dataToSend.append('paso', activeStep + 1);
      dataToSend.append('hoja', hoja);
      dataToSend.append('id_usuario', userData.id);
      dataToSend.append('name', userData.name);

      // Añadir los campos de pasoData al FormData, evitando duplicados
      Object.keys(pasoData).forEach((key) => {
          if (pasoData[key] !== undefined && pasoData[key] !== null) {
              dataToSend.append(key, pasoData[key]);
          }
      });

      // Añadir pieza gráfica como "N/A" si no está disponible
      dataToSend.append('pieza_grafica', formData.pieza_grafica ? formData.pieza_grafica : 'N/A');

      try {
          console.log("Enviando Datos:", dataToSend);

          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });

          // Mostrar modal de finalización si todo fue exitoso
          setIsLoading(false); // Finalizar el loading
          setShowModal(true);
      } catch (error) {
          console.error('Error al guardar los datos del último paso:', error);
          if (error.response) {
              console.error('Detalles del error:', error.response.data);
          }
      }
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
          return <Step5 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange}/>;
        default:
          return null;
      }
    };

    return (
      <Box>
        <Stepper
          activeStep={activeStep}
          sx={{
            '& .MuiStepLabel-root': {
              cursor: 'default', // Por defecto, los pasos no son clicables
            },
            '& .MuiStepLabel-root.Mui-completed': {
              cursor: 'pointer', // Pasos completados son clicables
            },
            '& .MuiStepLabel-root.Mui-active': {
              cursor: 'pointer', // Paso activo es clicable
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={index} sx={{marginBottom: '20px'}}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon
                  {...props}
                  active={index === activeStep}
                  completed={completedSteps.includes(index) || index < activeStep}
                />
              )}
              onClick={() => handleStepClick(index)} // Navegación controlada
              sx={{
                '& .MuiStepLabel-label': {
                  color: index === activeStep
                    ? '#FFFFFF'
                    : completedSteps.includes(index) || index < activeStep
                    ? '#4F4F4F'
                    : '#A0A0A0',
                  backgroundColor: index === activeStep ? '#0056b3' : 'transparent',
                  padding: index === activeStep ? '5px 10px' : '0',
                  borderRadius: '20px',
                  fontWeight: index === activeStep ? 'bold' : 'normal',
                  cursor: index <= highestStepReached ? 'pointer' : 'default',
                },
              }}
            >
              {label}
            </StepLabel>
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
            disabled={isLoading} // Deshabilitar el botón si está cargando
            startIcon={isLoading ? <CircularProgress size={20} /> : null} // Mostrar un CircularProgress si está cargando
          >
            {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
          </Button>
        </Box>

        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>Formulario Aprobación Finalizado</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Los datos del Formulario Aprobación han sido guardados, ¿Desea continuar con el siguiente formulario?
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
    );
  }

  export default FormSection;

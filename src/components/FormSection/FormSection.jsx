  import React, { useEffect, useState } from 'react';
  import { Stepper, Step, StepLabel, Button, Box, CircularProgress } from '@mui/material';
  import Step1 from './Step1'; 
  import Step2 from './Step2';
  import Step3 from './Step3';
  import Step4 from './Step4';
  import Step5 from './Step5';
  import axios from 'axios';
  import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
  import { useNavigate } from 'react-router-dom';
  import CheckIcon from '@mui/icons-material/Check'; 
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
    backgroundColor: ownerState.completed
      ? '#0056b3' 
      : ownerState.active
      ? '#0056b3' 
      : '#E0E0E0', 
    color: ownerState.completed || ownerState.active ? '#FFFFFF' : '#4F4F4F', 
    fontWeight: 'bold',
  }));

  /*
  Este componente se encarga de renderizar el contenido del ícono.
  - Si el paso está completado (`completed`), muestra un ícono de verificación (`CheckIcon`).
  - Si el paso no está completado, muestra el ícono correspondiente al paso (`icon`).
  */
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
    const [activeStep, setActiveStep] = useState(currentStep); 
    const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); 
    const [showModal, setShowModal] = useState(false); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();
    const [completedSteps, setCompletedSteps] = useState([]);
    const [highestStepReached, setHighestStepReached] = useState(0); 
    const [errors, setErrors] = useState({});

    /*
    Esta función se encarga de validar los campos requeridos del formulario en función del paso activo (`activeStep`).
    - Si algún campo obligatorio está vacío o no cumple los requisitos, agrega un mensaje de error específico al objeto `stepErrors`.
    - Devuelve `true` si no hay errores, indicando que el paso es válido; de lo contrario, devuelve `false`.
    */

    const validateStep = () => {
      const stepErrors = {};
    
      if (activeStep === 0) {
        if (!formData.fecha_solicitud) stepErrors.fecha_solicitud = "Este campo es obligatorio";
        if (!formData.nombre_actividad) stepErrors.nombre_actividad = "Este campo es obligatorio";
        if (!formData.nombre_solicitante) stepErrors.nombre_solicitante = "Este campo es obligatorio";
        if (formData.dependencia_tipo === "Escuelas" && !formData.nombre_escuela) {
          stepErrors.nombre_escuela = "Debe seleccionar una escuela";
        }
      } else if (activeStep === 1) {
        if (!formData.introduccion) stepErrors.introduccion = "Este campo es obligatorio";
        if (!formData.objetivo_general) stepErrors.objetivo_general = "Este campo es obligatorio";
        if (!formData.objetivos_especificos) stepErrors.objetivos_especificos = "Este campo es obligatorio";
        if (!formData.justificacion) stepErrors.justificacion = "Este campo es obligatorio";
        if (!formData.metodologia) stepErrors.metodologia = "Este campo es obligatorio";
      } else if (activeStep === 2) {
        if (!formData.tipo) stepErrors.tipo = "Debe seleccionar un tipo";
        if (!formData.modalidad) stepErrors.modalidad = "Debe seleccionar una modalidad";
        if (!formData.programCont) stepErrors.programCont = "Este campo es obligatorio";
        if (!formData.dirigidoa) stepErrors.dirigidoa = "Este campo es obligatorio";
        if (!formData.creditos) stepErrors.creditos = "Este campo es obligatorio";
        if (!formData.cupo_min) stepErrors.cupo_min = "Este campo es obligatorio";
        if (!formData.cupo_max) stepErrors.cupo_max = "Este campo es obligatorio";
      } else if (activeStep === 3) {
        if (!formData.nombre_coordinador) stepErrors.nombre_coordinador = "Este campo es obligatorio";
        if (!formData.correo_coordinador) stepErrors.correo_coordinador = "Este campo es obligatorio";
        if (!formData.tel_coordinador) stepErrors.tel_coordinador = "Este campo es obligatorio";
        if (!formData.perfil_competencia) stepErrors.perfil_competencia = "Este campo es obligatorio";
        if (!formData.formas_evaluacion) stepErrors.formas_evaluacion = "Este campo es obligatorio";
        if (!formData.certificado_solicitado) stepErrors.certificado_solicitado = "Debe seleccionar una opción";
        if (!formData.valor_inscripcion) stepErrors.valor_inscripcion = "Este campo es obligatorio";
      } else if (activeStep === 4) {
        if (!formData.becas_convenio) stepErrors.becas_convenio = "Este campo es obligatorio";
        if (!formData.becas_estudiantes) stepErrors.becas_estudiantes = "Este campo es obligatorio";
        if (!formData.becas_docentes) stepErrors.becas_docentes = "Este campo es obligatorio";
        if (!formData.becas_egresados) stepErrors.becas_egresados = "Este campo es obligatorio";
        if (!formData.becas_funcionarios) stepErrors.becas_funcionarios = "Este campo es obligatorio";
        if (!formData.becas_otros) stepErrors.becas_otros = "Este campo es obligatorio";
        if (!formData.periodicidad_oferta) stepErrors.periodicidad_oferta = "Debe seleccionar una periodicidad";
        if (!formData.organizacion_actividad) stepErrors.organizacion_actividad = "Debe seleccionar una opción";
        if (formData.extension_solidaria === "si" && !formData.costo_extension_solidaria) {
          stepErrors.costo_extension_solidaria = "Este campo es obligatorio";
        }
        if (!formData.personal_externo) stepErrors.personal_externo = "Este campo es obligatorio";
      }
    
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0; 
    };    

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
        setActiveStep(0); 
      } else {
        setActiveStep(currentStep);
      }
    }, [currentStep, steps.length]);

    
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
          setIsLoading(true); 
          const hoja = 1; 
          let pasoData = {};

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

          let dataToSend;

          if (formData.pieza_grafica && activeStep === 4) {
              dataToSend = new FormData();
              dataToSend.append('id_solicitud', idSolicitud);
              dataToSend.append('paso', activeStep + 1);
              dataToSend.append('hoja', hoja);
              dataToSend.append('id_usuario', userData.id);
              dataToSend.append('name', userData.name);

              Object.keys(pasoData).forEach((key) => {
                  dataToSend.append(key, pasoData[key]);
              });

              dataToSend.append('pieza_grafica', formData.pieza_grafica);
          } else {
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

              setIsLoading(false); 
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

    //Lógica del botón "Atrás"
    const handleBack = () => {
      if (activeStep > 0) {
        setActiveStep((prev) => prev - 1);
      }
    };

    const handleStepClick = (stepIndex) => {
      if (stepIndex <= highestStepReached) {
        setActiveStep(stepIndex); 
      }
    };

    /*
      - Envía los datos del último paso del formulario al servidor.
      - Construye los datos necesarios, incluyendo archivos si están presentes.
      - Muestra un modal de confirmación si el envío es exitoso y maneja errores en caso de fallas.
    */

    const handleSubmit = async () => {
        setIsLoading(true); 
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

        Object.keys(pasoData).forEach((key) => {
            if (pasoData[key] !== undefined && pasoData[key] !== null) {
                dataToSend.append(key, pasoData[key]);
            }
        });

        dataToSend.append('pieza_grafica', formData.pieza_grafica ? formData.pieza_grafica : 'N/A');

        try {
            console.log("Enviando Datos:", dataToSend);

            await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setIsLoading(false); 
            setShowModal(true);
        } catch (error) {
            console.error('Error al guardar los datos del último paso:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
            }
        }
    };

    /*
      - Devuelve el componente correspondiente al paso actual del formulario.
      - Cada caso del `switch` renderiza un componente específico (`Step1`, `Step2`, etc.) con las props necesarias.
      - Retorna `null` si el paso no es válido.
    */

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
              errors={errors}
            />
          );
        case 1:
          return <Step2 formData={formData} handleInputChange={handleInputChange} errors={errors} />;
        case 2:
          return <Step3 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
        case 3:
          return <Step4 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
        case 4:
          return <Step5 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} errors={errors} />;
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
              cursor: 'default', 
            },
            '& .MuiStepLabel-root.Mui-completed': {
              cursor: 'pointer', 
            },
            '& .MuiStepLabel-root.Mui-active': {
              cursor: 'pointer', 
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
              onClick={() => handleStepClick(index)} 
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

        {renderStepContent(activeStep, errors)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Atrás
          </Button>
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

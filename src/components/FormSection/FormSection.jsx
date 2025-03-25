import { useEffect, useState } from 'react';
  import { Stepper, Step, StepLabel, Button, Box, CircularProgress, useMediaQuery } from '@mui/material';
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
  import { openFormReport } from '../../services/reportServices';
  import PrintIcon from '@mui/icons-material/Print';
  import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
  import PropTypes from 'prop-types';
  import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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

  CustomStepIcon.propTypes = {
    active: PropTypes.bool.isRequired,
    completed: PropTypes.bool,
    icon: PropTypes.node,
  };
  
  function FormSection({ 
    formData,
    setFormData, 
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
    const [idSolicitud] = useState(localStorage.getItem('id_solicitud')); 
    const [showModal, setShowModal] = useState(false); 
    const [isLoading, setIsLoading] = useState(false); 
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const navigate = useNavigate();
    const [completedSteps, setCompletedSteps] = useState([]);
    const [highestStepReached, setHighestStepReached] = useState(0); 
    const [errors, setErrors] = useState({});
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const isVerySmallScreen = useMediaQuery('(max-width:375px)');

    /*
    Esta función se encarga de validar los campos requeridos del formulario en función del paso activo (`activeStep`).
    - Si algún campo obligatorio está vacío o no cumple los requisitos, agrega un mensaje de error específico al objeto `stepErrors`.
    - Devuelve `true` si no hay errores, indicando que el paso es válido; de lo contrario, devuelve `false`.
    */

    const validateStep = () => {
      const stepErrors = {};
    
      if (activeStep === 0) {
        //Validación de fecha, el nombre de la actividad y el solicitante
        if (!formData.fecha_solicitud) stepErrors.fecha_solicitud = "Este campo es obligatorio";
        if (!formData.nombre_actividad) stepErrors.nombre_actividad = "Este campo es obligatorio";
        if (!formData.nombre_solicitante) stepErrors.nombre_solicitante = "Este campo es obligatorio";
        if (!formData.dependencia_tipo) stepErrors.dependencia_tipo = "Debe seleccionar una dependencia";
        // Validaciones de Escuelas
        if (formData.dependencia_tipo === "Escuelas") {
          if (!formData.nombre_escuela) stepErrors.nombre_escuela = "Debe seleccionar una escuela";
          if (!formData.nombre_departamento) stepErrors.nombre_departamento = "Debe seleccionar un departamento";
          if (!formData.nombre_seccion) stepErrors.nombre_seccion = "Debe seleccionar una sección";
          if (!formData.nombre_dependencia) stepErrors.nombre_dependencia = "Debe seleccionar un programa académico";
        }
        // Si la dependencia es "Oficinas", validar su campo
        if (formData.dependencia_tipo === "Oficinas") {
          if (!formData.nombre_dependencia) stepErrors.nombre_dependencia = "Debe seleccionar una oficina";
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

        if (
          (formData.modalidad === "Presencial" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") &&
          !formData.horas_trabajo_presencial
        ) {
          stepErrors.horas_trabajo_presencial = "Debe ingresar las horas presenciales";
        }
        if (
          (formData.modalidad === "Presencial" || formData.modalidad === "Mixta" || 
          formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") &&
          (formData.horas_trabajo_presencial <= 0 || !formData.horas_trabajo_presencial)
        ) {
          stepErrors.horas_trabajo_presencial = "Debe ser mayor a 0";
        }
        if (
          (formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || 
          formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") &&
          (formData.horas_sincronicas <= 0 || !formData.horas_sincronicas)
        ) {
          stepErrors.horas_sincronicas = "Debe ser mayor a 0";
        }
        if (
          (formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") &&
          !formData.horas_sincronicas
        ) {
          stepErrors.horas_sincronicas = "Debe ingresar las horas sincrónicas";
        }
        if (!formData.total_horas) {
          stepErrors.total_horas = "Debe ingresar el total de horas";
        }
        if (!formData.programCont) stepErrors.programCont = "Este campo es obligatorio";
        if (!formData.dirigidoa) stepErrors.dirigidoa = "Este campo es obligatorio";
        if (!formData.creditos) stepErrors.creditos = "Este campo es obligatorio";
        if (!formData.creditos || formData.creditos < 1 || formData.creditos > 50) {
          stepErrors.creditos = "Debe ser entre 1 y 50 créditos";
        }
        if (!formData.cupo_min) stepErrors.cupo_min = "Este campo es obligatorio";
        if (!formData.cupo_max) stepErrors.cupo_max = "Este campo es obligatorio";
        if (
          formData.cupo_min &&
          formData.cupo_max &&
          parseInt(formData.cupo_min) > parseInt(formData.cupo_max)
        ) {
          stepErrors.cupo_min = "El cupo mínimo no puede ser mayor que el cupo máximo";
          stepErrors.cupo_max = "El cupo máximo debe ser mayor o igual al cupo mínimo";
        }

      } else if (activeStep === 3) {
        if (!formData.nombre_coordinador) stepErrors.nombre_coordinador = "Este campo es obligatorio";

        if (!formData.correo_coordinador) stepErrors.correo_coordinador = "Este campo es obligatorio";
        if (!formData.correo_coordinador) {
          stepErrors.correo_coordinador = "Este campo es obligatorio";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.correo_coordinador)) {
          stepErrors.correo_coordinador = "Correo electrónico inválido";
        }
        if (!formData.tel_coordinador) {
          stepErrors.tel_coordinador = "Este campo es obligatorio";
        } else if (!/^\d{7,15}$/.test(formData.tel_coordinador)) {
          stepErrors.tel_coordinador = "Debe tener entre 7 y 15 dígitos";
        }
        if (!formData.pefil_competencia) stepErrors.pefil_competencia = "Este campo es obligatorio";
        if (!formData.formas_evaluacion) stepErrors.formas_evaluacion = "Este campo es obligatorio";
        
        if (!formData.certificado_solicitado) {
          stepErrors.certificado_solicitado = "Debe seleccionar una opción";
      } else {
          if (formData.certificado_solicitado === "De aprobación" && !formData.calificacion_minima) {
              stepErrors.calificacion_minima = "Este campo es obligatorio";
          }
          if (formData.certificado_solicitado === "No otorga certificado" && !formData.razon_no_certificado) {
              stepErrors.razon_no_certificado = "Este campo es obligatorio";
          }
      }  
          if (formData.valor_inscripcion === 0) {
            // Valor válido, no hacer nada
        } else if (!formData.valor_inscripcion) {
            stepErrors.valor_inscripcion = "Este campo es obligatorio";
        } else if (typeof formData.valor_inscripcion !== 'number' || formData.valor_inscripcion < 0) {
            stepErrors.valor_inscripcion = "Debe ser un valor numérico válido";
        }
      } else if (activeStep === 4) {
        const camposBecas = [
          'becas_convenio',
          'becas_estudiantes',
          'becas_docentes',
          'becas_egresados',
          'becas_funcionarios',
          'becas_otros'
        ];
        camposBecas.forEach(campo => {
          const valor = formData[campo];
          if (valor === "" || valor === undefined || valor === null) { // Permitir 0 como valor válido
              stepErrors[campo] = "Este campo es obligatorio";
          }else {
            const numericValue = parseFloat(valor);
            if (isNaN(numericValue) || numericValue < 0) {
              stepErrors[campo] = "Debe ser un número mayor o igual a 0";
            }
          }
        });  
        if (!formData.periodicidad_oferta) stepErrors.periodicidad_oferta = "Debe seleccionar una periodicidad";
        if (!formData.organizacion_actividad) stepErrors.organizacion_actividad = "Debe seleccionar una opción";
        if (!formData.extension_solidaria) stepErrors.extension_solidaria = "Debe seleccionar una opción";
      
        if (formData.extension_solidaria === "si") {
          const costo = formData.costo_extension_solidaria;
          if (!costo && costo !== 0) {
            stepErrors.costo_extension_solidaria = "Este campo es obligatorio";
          } else if (isNaN(costo) || costo < 0) {
            stepErrors.costo_extension_solidaria = "Debe ser un valor válido";
          }
        }
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
        if (!userData || !userData.id) {
          alert("La información del usuario no está disponible. Por favor, inicia sesión nuevamente.");
          return; // o bien redirigir o mostrar un mensaje de error
        }
        if (!validateStep()) {
          console.log("Errores en los campos: ", errors);
          return;
        }
        if (activeStep < steps.length - 1) {
          setIsLoading(true);
          const hoja = 1;
          let pasoData = {};

          switch (activeStep) {
              case 0:{
                const fecha = new Date(formData.fecha_solicitud);
                    pasoData = {
                      id_solicitud: idSolicitud,
                      fecha_solicitud: fecha.toISOString().split('T')[0],
                      nombre_actividad: formData.nombre_actividad || 'N/A',
                      nombre_solicitante: formData.nombre_solicitante || 'N/A',
                      dependencia_tipo: formData.dependencia_tipo || 'N/A',
                      nombre_escuela: formData.nombre_escuela || 'N/A',
                      nombre_departamento: formData.nombre_departamento || 'N/A',
                      nombre_seccion: formData.nombre_seccion || 'N/A',
                      nombre_dependencia: formData.nombre_dependencia || 'N/A',
                  };
                }
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
                      pefil_competencia: formData.pefil_competencia || 'N/A',
                      formas_evaluacion: formData.formas_evaluacion || 'N/A',
                      certificado_solicitado: formData.certificado_solicitado || 'N/A',
                      calificacion_minima: formData.calificacion_minima || 'N/A',
                      razon_no_certificado: formData.razon_no_certificado || 'N/A',
                      valor_inscripcion: formData.valor_inscripcion || 'N/A',
                  };
                  break;
              case 4: {
                const totalBecas = (
                  parseInt(formData.becas_convenio || 0) +
                  parseInt(formData.becas_estudiantes || 0) +
                  parseInt(formData.becas_docentes || 0) +
                  parseInt(formData.becas_egresados || 0) +
                  parseInt(formData.becas_funcionarios || 0) +
                  parseInt(formData.becas_otros || 0)
              );
                  pasoData = {
                      becas_convenio: formData.becas_convenio || 'N/A',
                      becas_estudiantes: formData.becas_estudiantes || 'N/A',
                      becas_docentes: formData.becas_docentes || 'N/A',
                      becas_egresados: formData.becas_egresados || 'N/A',
                      becas_funcionarios: formData.becas_funcionarios || 'N/A',
                      becas_otros: formData.becas_otros || 'N/A',
                      becas_total: totalBecas.toString(),
                      periodicidad_oferta: formData.periodicidad_oferta || 'N/A',
                      organizacion_actividad: formData.organizacion_actividad || 'N/A',
                      otro_tipo_act: formData.otro_tipo_act || 'N/A',
                      extension_solidaria: formData.extension_solidaria || 'N/A',
                      costo_extension_solidaria: formData.costo_extension_solidaria || 'N/A',
                      personal_externo: formData.personal_externo || 'N/A',
                  };
                }
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
                headers: { 'Content-Type': 'multipart/form-data' },
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
            if (error.response) console.error('Detalles del error:', error.response.data);
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
        if (!validateStep()) {
          console.log("Errores en los campos: ", errors); 
          return; 
        }

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
              setFormData={setFormData}
              setErrors={setErrors}
              escuelas={escuelas}
              departamentos={departamentos}
              secciones={secciones}
              programas={programas}
              oficinas={oficinas}
              errors={errors}
            />
          );
        case 1:
          return <Step2 formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={errors} />;
        case 2:
          return <Step3 formData={formData} setFormData={setFormData}  errors={errors}/>;
        case 3:
          return <Step4 formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} errors={errors}/>;
        case 4:
          return <Step5 formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} errors={errors} />;
        default:
          return null;
      }
    };

    const PrintReportButton = () => {
      const isFormCompleted = activeStep === steps.length - 1 || completedSteps.includes(steps.length - 1);
      
      const handleGenerateReport = async () => {
        try {
          setIsGeneratingReport(true);
          const idSolicitud = localStorage.getItem('id_solicitud');
          await openFormReport(idSolicitud, 1); // 1 para el formulario de datos básicos
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
          zIndex: 1000 
        }}>
          <Tooltip title={isFormCompleted ? "Generar reporte" : "Complete el formulario para generar el reporte"}>
            <span>
              <IconButton 
                color="primary" 
                onClick={handleGenerateReport}
                disabled={!isFormCompleted || isGeneratingReport}
                size="large"
              >
                {isGeneratingReport ? 
                  <CircularProgress size={24} color="inherit" /> : 
                  <PrintIcon />
                }
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    };
    

    return (
      <Box sx={{ padding: isVerySmallScreen ? '10px' : isSmallScreen ? '15px' : '20px', width: '100%', position: 'relative' }}>
      <PrintReportButton />
        <Stepper
          activeStep={activeStep}
          sx={{
            marginBottom: isSmallScreen ? '15px' : '30px',
          '& .MuiStepLabel-label': {
            fontSize: isSmallScreen ? '12px' : '14px',
            textAlign: isSmallScreen ? 'center' : 'left', 
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={index}>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: isSmallScreen ? 'column' : 'row', marginTop: '20px', marginBottom: '20px' }}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ 
            width: isSmallScreen ? '100%' : 'auto', 
            marginBottom: isSmallScreen ? '10px' : '0' 
          }}>
            Atrás
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={isLoading} 
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ width: isSmallScreen ? '100%' : 'auto' }} 
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
              maxWidth: '450px',
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
            borderTop: '1px solid #f0f0f0',
            gap: 1
          }}>
            <Button onClick={() => window.location.href = '/'} color="secondary" variant="outlined">
              Salir
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setCurrentSection(2)} color="primary" variant="outlined">
                Continuar
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    setIsGeneratingReport(true);
                    const idSolicitud = localStorage.getItem('id_solicitud');
                    await openFormReport(idSolicitud, 1);
                    setCurrentSection(2);
                  } catch (error) {
                    console.error('Error al generar el reporte:', error);
                    alert('Hubo un problema al generar el reporte');
                  } finally {
                    setIsGeneratingReport(false);
                  }
                }} 
                color="primary" 
                variant="contained"
                disabled={isGeneratingReport}
                startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
              >
                {isGeneratingReport ? 'Generando...' : 'Generar y continuar'}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  FormSection.propTypes = {
    active: PropTypes.bool.isRequired,
    completed: PropTypes.bool,
    icon: PropTypes.node,
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    setCurrentSection: PropTypes.func.isRequired,
    escuelas: PropTypes.array,
    departamentos: PropTypes.array,
    secciones: PropTypes.array,
    programas: PropTypes.array,
    oficinas: PropTypes.array,
    userData: PropTypes.object,
    currentStep: PropTypes.number.isRequired,
    handleFileChange: PropTypes.func,
  };

  export default FormSection;
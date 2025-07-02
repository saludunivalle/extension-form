import { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, CircularProgress, useMediaQuery,  } from '@mui/material';
import Step1 from './Step1'; 
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import axios from 'axios';
import useInternalNavigationGoogleSheets from '../../hooks/useInternalNavigationGoogleSheets';
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
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import api from '../../services/api';

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

  CustomStepIcon.propTypes = {
    active: PropTypes.bool.isRequired,
    completed: PropTypes.bool,
    icon: PropTypes.node,
    accessible: PropTypes.bool,
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
    formId
  }) {
    const steps = [
      'Datos Generales',
      'Detalles de la Actividad',
      'Certificación y Evaluación',
      'Información Coordinador',
      'Información Adicional',
    ];
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

    const { 
      maxAllowedStep, 
      loading: navLoading, 
      isStepAllowed, 
      updateMaxAllowedStep  // Añade esta función a la destructuración
    } = useInternalNavigationGoogleSheets(idSolicitud, 1, steps.length);

    
    
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

        // Validación para modalidad Presencial asistida por tecnología (PAT)
        if (formData.modalidad === "Presencial asistida por tecnología") {
          if (!formData.horas_trabajo_pat) {
            stepErrors.horas_trabajo_pat = "Debe ingresar las horas de trabajo PAT";
          } else if (formData.horas_trabajo_pat <= 0) {
            stepErrors.horas_trabajo_pat = "Debe ser mayor a 0";
          }
        }

        // Validación para modalidad Presencial
        if (formData.modalidad === "Presencial") {
          if (!formData.horas_trabajo_presencial) {
            stepErrors.horas_trabajo_presencial = "Debe ingresar las horas presenciales";
          } else if (formData.horas_trabajo_presencial <= 0) {
            stepErrors.horas_trabajo_presencial = "Debe ser mayor a 0";
          }
        }

        // Validación para modalidad Virtual
        if (formData.modalidad === "Virtual") {
          if (!formData.horas_sincronicas) {
            stepErrors.horas_sincronicas = "Debe ingresar las horas sincrónicas";
          } else if (formData.horas_sincronicas <= 0) {
            stepErrors.horas_sincronicas = "Debe ser mayor a 0";
          }
        }

        // Validación para modalidades mixtas (Semipresencial, Mixta, Todas)
        if (["Semipresencial", "Mixta", "Todas las anteriores"].includes(formData.modalidad)) {
          if (!formData.horas_trabajo_presencial) {
            stepErrors.horas_trabajo_presencial = "Debe ingresar las horas presenciales";
          } else if (formData.horas_trabajo_presencial <= 0) {
            stepErrors.horas_trabajo_presencial = "Debe ser mayor a 0";
          }
          
          if (!formData.horas_sincronicas) {
            stepErrors.horas_sincronicas = "Debe ingresar las horas sincrónicas";
          } else if (formData.horas_sincronicas <= 0) {
            stepErrors.horas_sincronicas = "Debe ser mayor a 0";
          }
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

    // Efecto para actualizar highestStepReached basado en maxAllowedStep
    useEffect(() => {
      if (!navLoading && maxAllowedStep !== undefined) {
        console.log('maxAllowedStep:', maxAllowedStep);
        console.log('activeStep:', activeStep);
        console.log('isStepAllowed para siguiente paso:', isStepAllowed(activeStep + 1));
        // Asigna directamente maxAllowedStep para reflejar lo que viene del servidor
        setHighestStepReached(maxAllowedStep);
      }
    }, [maxAllowedStep, navLoading]);

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
                      nombre_actividad: formData.nombre_actividad || 'N/A',
                      fecha_solicitud: fecha.toISOString().split('T')[0],
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
                      introduccion: formData.introduccion || '',
                      objetivo_general: formData.objetivo_general || '',
                      objetivos_especificos: formData.objetivos_especificos || '',
                      justificacion: formData.justificacion || '',
                      metodologia: formData.metodologia || '',
                  };
                  break;
              case 2:
                  // Lógica especial para mapear horas según modalidad
                  let horasPresenciales = '0';
                  let horasSincronicas = '0';
                  
                  if (formData.modalidad === 'Presencial asistida por tecnología') {
                      // Para PAT, las horas van a horas_sincronicas
                      horasSincronicas = formData.horas_trabajo_pat || '0';
                  } else if (formData.modalidad === 'Presencial') {
                      horasPresenciales = formData.horas_trabajo_presencial || '0';
                  } else if (formData.modalidad === 'Virtual') {
                      horasSincronicas = formData.horas_sincronicas || '0';
                  } else if (['Semipresencial', 'Mixta', 'Todas las anteriores'].includes(formData.modalidad)) {
                      horasPresenciales = formData.horas_trabajo_presencial || '0';
                      horasSincronicas = formData.horas_sincronicas || '0';
                  }
                  
                  pasoData = {
                      tipo: formData.tipo || '',
                      otro_tipo: formData.otro_tipo || '',
                      modalidad: formData.modalidad || '',
                      horas_trabajo_presencial: horasPresenciales,
                      horas_sincronicas: horasSincronicas,
                      total_horas: formData.total_horas || '0',
                      programCont: formData.programCont || '',
                      dirigidoa: formData.dirigidoa || '',
                      creditos: formData.creditos || '0',
                      cupo_min: formData.cupo_min || '0',
                      cupo_max: formData.cupo_max || '0',
                  };
                  
                  // DEBUG: Log específico para paso 3 y cupos
                  console.log('🔍 DEBUG FRONTEND PASO 3:');
                  console.log('  formData original:', {
                    cupo_min: formData.cupo_min,
                    cupo_max: formData.cupo_max,
                    creditos: formData.creditos
                  });
                  console.log('  pasoData que se envía:', {
                    cupo_min: pasoData.cupo_min,
                    cupo_max: pasoData.cupo_max,
                    creditos: pasoData.creditos
                  });
                  console.log('  pasoData completo:', pasoData);
                  break;
              case 3:
                  pasoData = {
                      nombre_coordinador: formData.nombre_coordinador || '',
                      correo_coordinador: formData.correo_coordinador || '',
                      tel_coordinador: formData.tel_coordinador || '',
                      pefil_competencia: formData.pefil_competencia || '',
                      formas_evaluacion: formData.formas_evaluacion || '',
                      certificado_solicitado: formData.certificado_solicitado || '',
                      calificacion_minima: formData.calificacion_minima || '',
                      razon_no_certificado: formData.razon_no_certificado || '',
                      valor_inscripcion: formData.valor_inscripcion || '0',
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
                  
                  // Debug: Log específico para becas_otros
                  console.log("🔍 Debug becas_otros:", {
                    valorOriginal: formData.becas_otros,
                    valorEnviado: formData.becas_otros || '0',
                    tipo: typeof formData.becas_otros
                  });
                  
                  // Debug: Log para becas_total
                  console.log("🔍 Debug becas_total:", {
                    valorOriginal: formData.becas_total,
                    valorEnviado: totalBecas.toString(),
                    tipo: typeof formData.becas_total
                  });
                  
                  pasoData = {
                      becas_convenio: formData.becas_convenio || '0',
                      becas_estudiantes: formData.becas_estudiantes || '0',
                      becas_docentes: formData.becas_docentes || '0',
                      becas_egresados: formData.becas_egresados || '0',
                      becas_funcionarios: formData.becas_funcionarios || '0',
                      becas_otros: formData.becas_otros || '0',
                      becas_total: totalBecas.toString(),
                      periodicidad_oferta: formData.periodicidad_oferta || '',
                      
                      // Campos de organización normales
                      organizacion_actividad: formData.organizacion_actividad || '',
                      otro_tipo_act: formData.organizacion_actividad === 'otro_act' ? (formData.otro_tipo_act || '') : '',
                      
                      // Corregir extension_solidaria y costo_extension_solidaria
                      extension_solidaria: formData.extension_solidaria || '',
                      costo_extension_solidaria: formData.extension_solidaria === 'si' ? (formData.costo_extension_solidaria || '0') : '',
                      
                      // Campos faltantes que van a AU y AV
                      pieza_grafica: formData.pieza_grafica ? 'Archivo adjunto' : '',
                      personal_externo: formData.personal_externo || '',
                  };
                  
                  // Debug: Log del objeto pasoData completo
                  console.log("🔍 pasoData completo:", pasoData);
                  
                  // Debug: Log específico para los campos corregidos
                  console.log("🔍 Campos corregidos en handleNext:", {
                    organizacion_actividad: formData.organizacion_actividad || '',
                    otro_tipo_act: formData.organizacion_actividad === 'otro_act' ? (formData.otro_tipo_act || '') : '',
                    extension_solidaria: formData.extension_solidaria || '',
                    costo_extension_solidaria: formData.extension_solidaria === 'si' ? formData.costo_extension_solidaria : '',
                    personal_externo: formData.personal_externo
                  });
                  
                  // Debug: Log específico para campos AU y AV (paso 5)
                  console.log("🔍 DEBUG PASO 5 - Campos AU y AV:", {
                    pieza_grafica_original: formData.pieza_grafica,
                    pieza_grafica_enviado: formData.pieza_grafica ? 'Archivo adjunto' : '',
                    personal_externo_original: formData.personal_externo,
                    personal_externo_enviado: formData.personal_externo || ''
                  });
                  console.log("🔍 pasoData completo paso 5:", pasoData);
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
                id_usuario: userData?.id || '',  // Usar operador opcional para prevenir errores
                name: userData?.name || '',
                ...pasoData,
              };
          }

          try {
            console.log("Enviando Datos:", dataToSend);
            if (formData.pieza_grafica && activeStep === 4) {
              await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // 30 segundos de timeout
              });
            } else {
              try {
                await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
                  timeout: 30000, // 30 segundos de timeout
                });
                setCompletedSteps((prev) => [...prev, activeStep]);
              } catch (error) {
                console.error('Error al guardar el progreso:', error);
                if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
                  alert('El servidor está tardando en responder. Por favor, intenta nuevamente en unos momentos.');
                } else {
                  alert('Hubo un problema al guardar los datos. Por favor, inténtalo de nuevo.');
                }
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
            setActiveStep(prev => prev + 1);
            setHighestStepReached((prev) => Math.max(prev, activeStep + 1, maxAllowedStep));
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
        setActiveStep(stepIndex); // Permite cambiar a pasos ya alcanzados
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

        // Debug: Log específico para becas_otros en handleSubmit
        console.log("🔍 Debug becas_otros en handleSubmit:", {
            valorOriginal: formData.becas_otros,
            valorEnviado: formData.becas_otros || '0',
            tipo: typeof formData.becas_otros
        });

        // Debug: Log para becas_total en handleSubmit
        const totalBecasSubmit = (
            parseInt(formData.becas_convenio || 0) +
            parseInt(formData.becas_estudiantes || 0) +
            parseInt(formData.becas_docentes || 0) +
            parseInt(formData.becas_egresados || 0) +
            parseInt(formData.becas_funcionarios || 0) +
            parseInt(formData.becas_otros || 0)
        );
        console.log("🔍 Debug becas_total en handleSubmit:", {
            valorOriginal: formData.becas_total,
            valorCalculado: totalBecasSubmit,
            tipo: typeof formData.becas_total
        });

        let pasoData = {
            becas_convenio: formData.becas_convenio || '0',
            becas_estudiantes: formData.becas_estudiantes || '0',
            becas_docentes: formData.becas_docentes || '0',
            becas_egresados: formData.becas_egresados || '0',
            becas_funcionarios: formData.becas_funcionarios || '0',
            becas_otros: formData.becas_otros || '0',
            becas_total: totalBecasSubmit.toString(),
            periodicidad_oferta: formData.periodicidad_oferta || '',
            
            // Campos de organización normales
            organizacion_actividad: formData.organizacion_actividad || '',
            otro_tipo_act: formData.organizacion_actividad === 'otro_act' ? (formData.otro_tipo_act || '') : '',
            
            // Corregir extension_solidaria y costo_extension_solidaria
            extension_solidaria: formData.extension_solidaria || '',
            costo_extension_solidaria: formData.extension_solidaria === 'si' ? (formData.costo_extension_solidaria || '0') : '',
            
            personal_externo: formData.personal_externo || '',
        };

        console.log("🔍 Valores críticos antes de enviar:", {
          organizacion_actividad: formData.organizacion_actividad || '',
          otro_tipo_act: formData.organizacion_actividad === 'otro_act' ? (formData.otro_tipo_act || '') : '',
          extension_solidaria: formData.extension_solidaria || '',
          costo_extension_solidaria: formData.extension_solidaria === 'si' ? formData.costo_extension_solidaria : '',
          personal_externo: formData.personal_externo,
          pieza_grafica: formData.pieza_grafica ? 'Archivo adjunto' : 'Sin archivo'
        });

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

        dataToSend.append('pieza_grafica', formData.pieza_grafica ? formData.pieza_grafica : '');

        try {
            console.log("Enviando Datos:", dataToSend);

            await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 segundos de timeout
            });

            updateMaxAllowedStep(activeStep + 1);

            setIsLoading(false); 
            setShowModal(true);
        } catch (error) {
            console.error('Error al guardar los datos del último paso:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
            }
            
            // Mostrar mensaje específico para timeout
            if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
                alert('El servidor está tardando en responder. Por favor, intenta nuevamente en unos momentos.');
            } else {
                alert('Hubo un problema al guardar los datos. Por favor, inténtalo de nuevo.');
            }
            setIsLoading(false);
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
          etapa_destino: formId || 1, // Usar el formId correspondiente (1, 2, 3 o 4)
          paso_destino: 1
        });
        
        if (response.data.success && response.data.estado?.estadoFormularios) {
          // Comprobar si este formulario está marcado como "Completado"
          const formStatus = response.data.estado.estadoFormularios[formId.toString()];
          setIsFormCompletedBackend(formStatus === 'Completado');
          console.log(`Estado del formulario ${formId} según backend: ${formStatus}`);
        }
      } catch (error) {
        console.error('Error al verificar estado del formulario:', error);
      }
    };
    
    checkFormCompletion();
  }, [idSolicitud]);
  
  // NUEVA LÓGICA: Si el formulario no está completado según el backend,
  // el botón solo se habilita en el último paso Y después de enviar los datos
  const isLastStepCompleted = (
    // Estamos exactamente en el último paso
    activeStep === steps.length - 1 && 
    // El servidor ha registrado la finalización del último paso
    maxAllowedStep >= steps.length
  );
  
  // El botón se activa si:
  // 1. El formulario está completado según el backend, O
  // 2. Se ha completado el último paso (según las condiciones de arriba)
  const isButtonEnabled = isFormCompletedBackend || isLastStepCompleted;
  
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      await openFormReport(idSolicitud, formId); // Usar el formId correspondiente
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
      <Box sx={{ padding: isVerySmallScreen ? '10px' : isSmallScreen ? '15px' : '20px', width: '100%', position: 'relative' }}>
        {navLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

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
                  completed={completedSteps.includes(index)}
                  accessible={index <= highestStepReached}
                />
              )}
              onClick={() => handleStepClick(index)}
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
                        ? '#81bef7' // Accesible no completado: azul claro
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
                onClick={() => setCurrentSection(2)} 
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
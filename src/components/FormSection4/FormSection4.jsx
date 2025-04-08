import { useEffect, useState } from 'react';
import {  Box, Button, Stepper, Step, StepLabel, Typography, Modal, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { openFormReport } from '../../services/reportServices';
import PrintIcon from '@mui/icons-material/Print';
import PropTypes from 'prop-types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useInternalNavigationGoogleSheets from '../../hooks/useInternalNavigationGoogleSheets';
import Step1FormSection4 from './Step1FormSection4';
import Step2FormSection4 from './Step2FormSection4';
import Step3FormSection4 from './Step3FormSection4';
import Step4FormSection4 from './Step4FormSection4';
import Step5FormSection4 from './Step5FormSection4';

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
  

function FormSection4({ formData, handleInputChange, userData, currentStep, formId }) {
  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];
  const [activeStep, setActiveStep] = useState(currentStep); // Usar currentStep como el paso inicial
  const [openModal, setOpenModal] = useState(false); // Estado para el modal
  const id_usuario = userData?.id_usuario;
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const location = useLocation(); // Obtener la ubicación actual
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0); // Máximo paso alcanzado
  
  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  const { maxAllowedStep, loading: navLoading, error: navError, isStepAllowed } = 
  useInternalNavigationGoogleSheets(idSolicitud, 4, steps.length);

  const [errors, setErrors] = useState({});

  /*
  Esta función se encarga de validar los campos requeridos del formulario en función del paso activo (`activeStep`).
  - Si algún campo obligatorio está vacío o no cumple los requisitos, agrega un mensaje de error específico al objeto `stepErrors`.
  - Devuelve `true` si no hay errores, indicando que el paso es válido; de lo contrario, devuelve `false`.
  */
  const validateStep = () => {
    const stepErrors = {};
  
    if (activeStep === 0) {
      // Validaciones para Step1FormSection4
      if (!formData.descripcionPrograma) {
        stepErrors.descripcionPrograma = "Este campo es obligatorio";
      }
      if (!formData.identificacionNecesidades) {
        stepErrors.identificacionNecesidades = "Este campo es obligatorio";
      }
    } else if (activeStep === 1) {
      // Validaciones para Step2FormSection4
      if (!formData.atributosBasicos) {
        stepErrors.atributosBasicos = "Este campo es obligatorio";
      }
      if (!formData.atributosDiferenciadores) {
        stepErrors.atributosDiferenciadores = "Este campo es obligatorio";
      }
      if (!formData.competencia) {
        stepErrors.competencia = "Este campo es obligatorio";
      }
      if (!formData.programa) {
        stepErrors.programa = "Este campo es obligatorio";
      }
      if (!formData.programasSimilares) {
        stepErrors.programasSimilares = "Este campo es obligatorio";
      }
      if (!formData.estrategiasCompetencia) {
        stepErrors.estrategiasCompetencia = "Este campo es obligatorio";
      }
    } else if (activeStep === 2) {
      const checkboxGroups = [
        {
          checkboxes: ['personasInteresChecked', 'personasMatriculadasChecked', 'otroInteresChecked'],
          otroCheckbox: 'otroInteresChecked',
          otherField: 'otroInteres',
          errorKey: 'indicadoresPrevios'
        },
        {
          checkboxes: ['innovacion', 'solicitudExterno', 'interesSondeo', 'otroMercadeoChecked'],
          otroCheckbox: 'otroMercadeoChecked',
          otherField: 'otroMercadeo',
          errorKey: 'variablesMercadeo'
        },
        {
          checkboxes: ['llamadas', 'encuestas', 'webinar', 'pautas_redes', 'otroEstrategiasChecked'],
          otroCheckbox: 'otroEstrategiasChecked',
          otherField: 'otroEstrategias',
          errorKey: 'estrategiasSondeo'
        },
        {
          checkboxes: ['preregistroFisico', 'preregistroGoogle', 'preregistroOtroChecked'],
          otroCheckbox: 'preregistroOtroChecked',
          otherField: 'preregistroOtro',
          errorKey: 'preregistro'
        }
      ];
  
      checkboxGroups.forEach(group => {
        const isAnyChecked = group.checkboxes.some(checkbox => formData[checkbox] === 'Sí');
        if (!isAnyChecked) {
          stepErrors[group.errorKey] = 'Debe seleccionar al menos una opción';
        } else {
          if (group.otroCheckbox) {
            const isOtroChecked = formData[group.otroCheckbox] === 'Sí';
            if (isOtroChecked && !formData[group.otherField]?.trim()) {
              stepErrors[group.otherField] = 'Este campo es obligatorio cuando se selecciona "Otro"';
            }
          }
        }
      });
    } else if (activeStep === 3) { // Paso 4
      const checkboxGroups = [
        {
          checkboxes: ['gremios', 'sectores_empresariales', 'politicas_publicas', 'otros_mesas_trabajoChecked'],
          otroCheckbox: 'otros_mesas_trabajoChecked',
          otherField: 'otros_mesas_trabajo',
          errorKey: 'mesasTrabajo'
        },
        {
          checkboxes: ['focusGroup', 'desayunosTrabajo', 'almuerzosTrabajo', 'openHouse', 'ferias_colegios', 'ferias_empresarial', 'otros_mercadeoChecked'],
          otroCheckbox: 'otros_mercadeoChecked',
          otherField: 'otros_mercadeo',
          errorKey: 'actividadesMercadeo'
        },
        {
          checkboxes: ['modalidadPresencial', 'modalidadVirtual', 'modalidadSemipresencial', 'traslados_docente', 'modalidad_asistida_tecnologia'],
          errorKey: 'modalidades'
        }
      ];
  
      // Validar radio button
      if (!formData.valorEconomico) {
        stepErrors.valorEconomico = 'Este campo es obligatorio';
      }
  
      checkboxGroups.forEach(group => {
        const isAnyChecked = group.checkboxes.some(checkbox => formData[checkbox] === 'Sí');
        
        if (!isAnyChecked) {
          stepErrors[group.errorKey] = 'Debe seleccionar al menos una opción';
        }
        
        if (group.otroCheckbox) {
          const isOtroChecked = formData[group.otroCheckbox] === 'Sí';
          if (isOtroChecked && !formData[group.otherField]?.trim()) {
            stepErrors[group.otherField] = 'Campo obligatorio cuando selecciona "Otro"';
          }
        }
      });
    } else if (activeStep === 4) {
      const requiredFields = [
        'beneficiosTangibles',
        'beneficiosIntangibles',
        'tendenciasActuales',
        'dofaDebilidades',
        'dofaOportunidades',
        'dofaFortalezas',
        'dofaAmenazas'
      ];
      
      requiredFields.forEach(field => {
        if (!formData[field]?.trim()) {
          stepErrors[field] = 'Este campo es obligatorio';
        }
      });

      const checkboxGroups = [
        {
          checkboxes: ['particulares', 'colegios', 'empresas', 'egresados', 'colaboradores', 'otros_publicos_potencialesChecked'],
          otroCheckbox: 'otros_publicos_potencialesChecked',
          otherField: 'otros_publicos_potenciales',
          errorKey: 'publicosPotenciales'
        },
        {
          checkboxes: ['paginaWeb', 'facebook', 'instagram', 'linkedin', 'correo', 'prensa', 'boletin', 'llamadas_redes', 'otro_canalChecked'],
          otroCheckbox: 'otro_canalChecked',
          otherField: 'otro_canal',
          errorKey: 'canalesDivulgacion'
        }
      ];
  
      checkboxGroups.forEach(group => {
        const isAnyChecked = group.checkboxes.some(checkbox => formData[checkbox] === 'Sí');
        if (!isAnyChecked) {
          stepErrors[group.errorKey] = 'Debe seleccionar al menos una opción';
        }
        if (group.otroCheckbox) {
          const isOtroChecked = formData[group.otroCheckbox] === 'Sí';
          if (isOtroChecked && !formData[group.otherField]?.trim()) {
            stepErrors[group.otherField] = 'Campo obligatorio cuando se selecciona "Otro"';
          }
        }
      });
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      console.warn('Paso inicial fuera de rango. Reiniciando al primer paso.');
      setActiveStep(0);
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);
  
  useEffect(() => {
    if (!idSolicitud || isNaN(parseInt(idSolicitud, 10))) {
      alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      navigate('/');
    }
  }, [idSolicitud, navigate]);
  
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      console.warn('Paso inicial fuera de rango. Reiniciando al primer paso.');
      setActiveStep(0);
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
      setHighestStepReached(prev => Math.max(prev, maxAllowedStep));
    }
  }, [maxAllowedStep, navLoading, activeStep, isStepAllowed]);
  
  /*
    Lógica del botón "Siguiente"
    - Valida los campos del paso actual. Si hay errores, detiene el avance.
    - Construye los datos necesarios (`pasoData`) según el paso activo, incluyendo archivos si aplica.
    - Envía los datos al servidor usando `axios` y maneja errores de la solicitud.
    - Si el envío es exitoso, marca el paso como completado, avanza al siguiente y actualiza el estado del progreso.
  */
  const handleNext = async () => {
    if (!validateStep()) {
      console.log("Errores en los campos: ", errors); // Opcional: Depuración
      return; // Detén el avance si hay errores
    }
    if (activeStep < steps.length - 1) {
      setIsLoading(true); // Finalizar el loading
      const hoja = 4; 

      const completarValoresConNo = (data) => {
          const completado = {};
          for (let key in data) {
              completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
          }
          return completado;
      };
      
      let pasoData = {};

      switch (activeStep) {
          case 0:
              pasoData = {
                  descripcionPrograma: formData.descripcionPrograma || 'No',
                  identificacionNecesidades: formData.identificacionNecesidades || 'No',
              };
              break;
          case 1:
              pasoData = {
                  atributosBasicos: formData.atributosBasicos || 'No',
                  atributosDiferenciadores: formData.atributosDiferenciadores || 'No',
                  competencia: formData.competencia || 'No',
                  programa: formData.programa || 'No',
                  programasSimilares: formData.programasSimilares || 'No',
                  estrategiasCompetencia: formData.estrategiasCompetencia || 'No',
              };
              break;
          case 2:
              pasoData = {
                  personasInteresChecked: formData.personasInteresChecked || 'No',
                  personasMatriculadasChecked: formData.personasMatriculadasChecked || 'No',
                  otroInteresChecked: formData.otroInteresChecked || 'No',
                  otroInteres: formData.otroInteres || 'No',
                  innovacion: formData.innovacion || 'No',
                  solicitudExterno: formData.solicitudExterno || 'No',
                  interesSondeo: formData.interesSondeo || 'No',
                  otroMercadeoChecked: formData.otroMercadeoChecked || 'No',
                  otroMercadeo: formData.otroMercadeo || 'No',
                  llamadas: formData.llamadas || 'No',
                  encuestas: formData.encuestas || 'No',
                  webinar: formData.webinar || 'No',
                  pautas_redes: formData.pautas_redes || 'No',
                  otroEstrategiasChecked: formData.otroEstrategiasChecked || 'No',
                  otroEstrategias: formData.otroEstrategias || 'No',
                  preregistroFisico: formData.preregistroFisico || 'No',
                  preregistroGoogle: formData.preregistroGoogle || 'No',
                  preregistroOtroChecked: formData.preregistroOtroChecked || 'No',
                  preregistroOtro: formData.preregistroOtro || 'No',
              };
              break;
          case 3:
              pasoData = {
                  gremios: formData.gremios || 'No',
                  sectores_empresariales: formData.sectores_empresariales || 'No',
                  politicas_publicas: formData.politicas_publicas || 'No',
                  otros_mesas_trabajo: formData.otros_mesas_trabajo || 'No',
                  focusGroup: formData.focusGroup || 'No',
                  desayunosTrabajo: formData.desayunosTrabajo || 'No',
                  almuerzosTrabajo: formData.almuerzosTrabajo || 'No',
                  openHouse: formData.openHouse || 'No',
                  otros_mercadeoChecked: formData.otros_mercadeoChecked || 'No',
                  otros_mercadeo: formData.otros_mercadeo || 'No',
                  ferias_colegios: formData.ferias_colegios || 'No',
                  ferias_empresarial: formData.ferias_empresarial || 'No',
                  valorEconomico: formData.valorEconomico || 'No',
                  modalidadPresencial: formData.modalidadPresencial || 'No',
                  modalidadVirtual: formData.modalidadVirtual || 'No',
                  modalidadSemipresencial: formData.modalidadSemipresencial || 'No',
                  traslados_docente: formData.traslados_docente || 'No',
                  modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia || 'No',
              };
              break;
          case 4:
            pasoData = {
              beneficiosTangibles: formData.beneficiosTangibles || 'No',
              beneficiosIntangibles: formData.beneficiosIntangibles || 'No',
              particulares: formData.particulares || 'No',
              colegios: formData.colegios || 'No',
              empresas: formData.empresas || 'No',
              egresados: formData.egresados || 'No',
              colaboradores: formData.colaboradores || 'No',
              otros_publicos_potenciales: formData.otros_publicos_potenciales || 'No',
              otros_publicos_potencialesChecked: formData.otros_publicos_potencialesChecked || 'No',
              otro_canalChecked: formData.otro_canalChecked || 'No',
              tendenciasActuales: formData.tendenciasActuales || 'No',
              dofaDebilidades: formData.dofaDebilidades || 'No',
              dofaOportunidades: formData.dofaOportunidades || 'No',
              dofaFortalezas: formData.dofaFortalezas || 'No',
              dofaAmenazas: formData.dofaAmenazas || 'No',
              paginaWeb: formData.paginaWeb || 'No',
              facebook: formData.facebook || 'No',
              instagram: formData.instagram || 'No',
              linkedin: formData.linkedin || 'No',
              correo: formData.correo || 'No',
              prensa: formData.prensa || 'No',
              boletin: formData.boletin || 'No',
              llamadas_redes: formData.llamadas_redes || 'No',
              otro_canal: formData.otro_canal || 'No',
            };
              break;
          default:
              break;
      }

      const pasoDataCompleto = completarValoresConNo(pasoData);

      try {
          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
            id_solicitud: idSolicitud,
            ...pasoDataCompleto,
            paso: activeStep + 1,
            hoja,
            id_usuario: userData.id_usuario,
            name: userData.name,
          });
          setIsLoading(false); // Finalizar el loading
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

  // Lógica del botón "Atrás"
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Finalizar el loading

      const hoja = 4; // Cambia este valor según la hoja a la que corresponda el formulario

      const completarValoresConNo = (data) => {
          const completado = {};
          for (let key in data) {
              completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
          }
          return completado;
      };

      const pasoData = {
          beneficiosTangibles: formData.beneficiosTangibles || 'No',
          beneficiosIntangibles: formData.beneficiosIntangibles || 'No',
          particulares: formData.particulares || 'No',
          colegios: formData.colegios || 'No',
          empresas: formData.empresas || 'No',
          egresados: formData.egresados || 'No',
          colaboradores: formData.colaboradores || 'No',
          otros_publicos_potenciales: formData.otros_publicos_potenciales || 'No',
          tendenciasActuales: formData.tendenciasActuales || 'No',
          dofaDebilidades: formData.dofaDebilidades || 'No',
          dofaOportunidades: formData.dofaOportunidades || 'No',
          dofaFortalezas: formData.dofaFortalezas || 'No',
          dofaAmenazas: formData.dofaAmenazas || 'No',
          paginaWeb: formData.paginaWeb || 'No',
          facebook: formData.facebook || 'No',
          instagram: formData.instagram || 'No',
          linkedin: formData.linkedin || 'No',
          correo: formData.correo || 'No',
          prensa: formData.prensa || 'No',
          boletin: formData.boletin || 'No',
          llamadas: formData.llamadas || 'No',
          otro_canal: formData.otro_canal || 'No',
      };

      const pasoDataCompleto = completarValoresConNo(pasoData);

      try {
          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
              id_solicitud: idSolicitud, // El ID único de la solicitud
              ...pasoDataCompleto, // Datos del último paso (Paso 5)
              paso: 5, // El número del último paso
              etapa_actual: 5, // Indica que es el último formulario
              hoja, // Indica qué hoja se está usando
              id_usuario: userData.id_usuario, // Enviar el id_usuario
              name: userData.name, // Enviar el nombre del usuario
          });
          setIsLoading(false); // Finalizar el loading
          setOpenModal(true); // Abre el modal
      } catch (error) {
          console.error('Error al guardar los datos del último paso:', error);
      }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
    }
  };


  const handleCloseModal = () => {
    setOpenModal(false);
    navigate('/');
  };
  
  const handleExitClick = () => {
    setExitDialogOpen(true);
  };

  const handleCloseExitDialog = () => {
    setExitDialogOpen(false);
  };

  const handleExitWithReport = async () => {
    try {
      setIsGeneratingReport(true);
      const idSolicitud = localStorage.getItem('id_solicitud');
      await openFormReport(idSolicitud, 4); // 4 corresponde al formulario de mercadeo
      navigate('/');
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Hubo un problema al generar el reporte');
    } finally {
      setIsGeneratingReport(false);
      setExitDialogOpen(false);
    }
  };

  

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection4 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
      case 1:
        return <Step2FormSection4 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
      case 2:
        return <Step3FormSection4 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
      case 3:
        return <Step4FormSection4 formData={formData} handleInputChange={handleInputChange} errors={errors} />;
      case 4:
        return <Step5FormSection4 formData={formData} handleInputChange={handleInputChange} errors={errors}/>;
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
          etapa_destino: formId || 4, // Usar el formId correspondiente (1, 2, 3 o 4)
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
      const idSolicitud = localStorage.getItem('id_solicitud');
      await openFormReport(idSolicitud, 4); // Use form number 4
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
            sx={{
              '& .MuiStepLabel-label': {
                backgroundColor: index <= highestStepReached ? '#0056b3' : 'transparent',
                color: index <= highestStepReached ? '#FFFFFF' : '#A0A0A0',
                padding: index <= highestStepReached ? '5px 10px' : '0',
                borderRadius: '20px',
                fontWeight: index === activeStep ? 'bold' : 'normal',
                cursor: index <= highestStepReached ? 'pointer' : 'default',
                opacity: index <= highestStepReached ? 1 : 0.6,
              },
              '& .MuiStepIcon-root': {
                color: index <= highestStepReached ? '#0056b3' : '#E0E0E0',
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

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        {activeStep === 0 ? (
          <Button onClick={handleExitClick}>
            Salir
          </Button>
        ) : (
          <Button onClick={handleBack}>
            Atrás
          </Button>
        )}
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
        open={exitDialogOpen}
        onClose={handleCloseExitDialog}
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
          ¿Salir del formulario?
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Deseas salir del formulario? Los datos guardados se mantendrán.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          p: 2,
          borderTop: '1px solid #f0f0f0',
          gap: 2
        }}>
          <Button onClick={handleCloseExitDialog} color="primary" variant="outlined">
            Cancelar
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => navigate('/')} color="secondary" variant="outlined">
              Volver al inicio
            </Button>
            <Button 
              onClick={handleExitWithReport} 
              color="primary" 
              variant="contained"
              disabled={isGeneratingReport}
              startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
            >
              {isGeneratingReport ? 'Generando...' : 'Generar y volver'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Modal existente para finalización del formulario */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '500px',
          boxShadow: 24,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: '28px' }} />
            <Typography variant="h6">Formulario completado con éxito</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => navigate('/')} color="secondary" variant="outlined">
              Volver al inicio
            </Button>
            <Button 
              onClick={async () => {
                try {
                  setIsGeneratingReport(true);
                  const idSolicitud = localStorage.getItem('id_solicitud');
                  await openFormReport(idSolicitud, 4);
                  navigate('/');
                } catch (error) {
                  console.error('Error al generar el reporte:', error);
                } finally {
                  setIsGeneratingReport(false);
                }
              }} 
              color="primary" 
              variant="contained"
              disabled={isGeneratingReport}
              startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
            >
              {isGeneratingReport ? 'Generando...' : 'Generar y volver'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

FormSection4.propTypes = {
  formData: PropTypes.shape({
    descripcionPrograma: PropTypes.string,
    identificacionNecesidades: PropTypes.string,
    atributosBasicos: PropTypes.string,
    atributosDiferenciadores: PropTypes.string,
    competencia: PropTypes.string,
    programa: PropTypes.string,
    programasSimilares: PropTypes.string,
    estrategiasCompetencia: PropTypes.string,
    personasInteresChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    personasMatriculadasChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    otroInteres: PropTypes.string,
    otroInteresChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    innovacion: PropTypes.string,
    solicitudExterno: PropTypes.string,
    interesSondeo: PropTypes.string,
    otroMercadeo: PropTypes.string,
    otroMercadeoChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    llamadas: PropTypes.string,
    encuestas: PropTypes.string,
    webinar: PropTypes.string,
    pautas_redes: PropTypes.string,
    otroEstrategias: PropTypes.string,
    otroEstrategiasChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    preregistroFisico: PropTypes.string,
    preregistroGoogle: PropTypes.string,
    preregistroOtro: PropTypes.string,
    preregistroOtroChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    gremios: PropTypes.string,
    sectores_empresariales: PropTypes.string,
    politicas_publicas: PropTypes.string,
    otros_mesas_trabajo: PropTypes.string,
    otros_mesas_trabajoChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    focusGroup: PropTypes.string,
    desayunosTrabajo: PropTypes.string,
    almuerzosTrabajo: PropTypes.string,
    openHouse: PropTypes.string,
    ferias_colegios: PropTypes.string,
    ferias_empresarial: PropTypes.string,
    otros_mercadeo: PropTypes.string,
    otros_mercadeoChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    valorEconomico: PropTypes.string,
    modalidadPresencial: PropTypes.string,
    modalidadVirtual: PropTypes.string,
    modalidadSemipresencial: PropTypes.string,
    traslados_docente: PropTypes.string,
    modalidad_asistida_tecnologia: PropTypes.string,
    beneficiosTangibles: PropTypes.string,
    beneficiosIntangibles: PropTypes.string,
    particulares: PropTypes.string,
    colegios: PropTypes.string,
    empresas: PropTypes.string,
    egresados: PropTypes.string,
    colaboradores: PropTypes.string,
    otros_publicos_potenciales: PropTypes.string,
    otros_publicos_potencialesChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    tendenciasActuales: PropTypes.string,
    dofaDebilidades: PropTypes.string,
    dofaOportunidades: PropTypes.string,
    dofaFortalezas: PropTypes.string,
    dofaAmenazas: PropTypes.string,
    paginaWeb: PropTypes.string,
    facebook: PropTypes.string,
    instagram: PropTypes.string,
    linkedin: PropTypes.string,
    correo: PropTypes.string,
    prensa: PropTypes.string,
    boletin: PropTypes.string,
    llamadas_redes: PropTypes.string,
    otro_canal: PropTypes.string,
    otro_canalChecked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  currentStep: PropTypes.number.isRequired,
};


export default FormSection4;

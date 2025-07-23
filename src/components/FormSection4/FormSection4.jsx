import { useEffect, useState } from 'react';
import {  Box, Button, Stepper, Step, StepLabel, Typography, Modal, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { openFormReport, downloadFormReport } from '../../services/reportServices';
import { retryWithBackoff } from '../../utils/apiUtils'; // Import retry utility
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

  const { maxAllowedStep, loading: navLoading, error: navError, isStepAllowed,
    updateMaxAllowedStep, formularioCompleto, estadoFormularios } = 
  useInternalNavigationGoogleSheets(idSolicitud, 4, steps.length);

  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

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
      // Añadir log de los valores de los checkboxes cruciales para depuración
      console.log('Valores de checkboxes en validación:', {
        personasInteresChecked: formData.personasInteresChecked,
        personasMatriculadasChecked: formData.personasMatriculadasChecked
      });
      
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
  
  // FIXED: Removed duplicate useEffect and consolidated logic
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
    if (!navLoading && maxAllowedStep !== undefined) {
      console.log('maxAllowedStep:', maxAllowedStep);
      console.log('activeStep:', activeStep);
      console.log('isStepAllowed para siguiente paso:', isStepAllowed(activeStep + 1));
      
      // Actualiza el paso más alto alcanzado según lo que permite el servidor
      setHighestStepReached(prev => {
        // Si el formulario está completado, permitir todos los pasos
        if (formularioCompleto || estadoFormularios?.["4"] === "Completado") {
          return steps.length - 1;
        }
        return Math.max(prev, maxAllowedStep, activeStep); // Incluir activeStep actual
      });
    }
  }, [maxAllowedStep, navLoading, activeStep, isStepAllowed, formularioCompleto, estadoFormularios, steps.length]);
  
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
              // Si el campo está definido como string y tiene algún contenido, lo dejamos tal cual
              if (typeof data[key] === 'string' && data[key].trim() !== '') {
                  completado[key] = data[key];
              } 
              // Solo convertir a 'No' si es undefined, null o cadena vacía
              else if (data[key] === '' || data[key] === null || data[key] === undefined) {
                  completado[key] = 'No';
              } 
              // Para cualquier otro caso, mantener el valor original
              else {
                  completado[key] = data[key];
              }
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
              // Campos principales que deben enviarse a Google Sheets
              console.log('Valores de los checkboxes antes de enviar:', {
                personasInteresChecked: formData.personasInteresChecked,
                personasMatriculadasChecked: formData.personasMatriculadasChecked,
                otroInteresChecked: formData.otroInteresChecked
              });
              
              // Debug completo para el paso 3
              console.log('PASO 3 - DATOS COMPLETOS:', {
                // Grupo 1 - Indicadores previos
                personasInteresChecked: formData.personasInteresChecked,
                personasMatriculadasChecked: formData.personasMatriculadasChecked,
                otroInteresChecked: formData.otroInteresChecked,
                otroInteres: formData.otroInteres,
                
                // Grupo 2 - Variables mercadeo
                innovacion: formData.innovacion,
                solicitudExterno: formData.solicitudExterno,
                interesSondeo: formData.interesSondeo,
                otroMercadeoChecked: formData.otroMercadeoChecked,
                otroMercadeo: formData.otroMercadeo,
                
                // Grupo 3 - Estrategias sondeo
                llamadas: formData.llamadas,
                encuestas: formData.encuestas,
                webinar: formData.webinar,
                pautas_redes: formData.pautas_redes,
                otroEstrategiasChecked: formData.otroEstrategiasChecked,
                otroEstrategias: formData.otroEstrategias,
                
                // Grupo 4 - Preregistro
                preregistroFisico: formData.preregistroFisico,
                preregistroGoogle: formData.preregistroGoogle,
                preregistroOtroChecked: formData.preregistroOtroChecked,
                preregistroOtro: formData.preregistroOtro
              });
              
              // Trace específico de los campos 'otro' y sus checkboxes relacionados
              console.log('CAMPOS OTRO - FORMATO DETALLADO:', {
                // 'Otros indicadores' y su checkbox
                otroInteresChecked: formData.otroInteresChecked,
                otroInteresValue: formData.otroInteres,
                otroInteresFinal: formData.otroInteresChecked === 'Sí' ? (formData.otroInteres || '') : 'No',
                
                // 'Otro mercadeo' y su checkbox
                otroMercadeoChecked: formData.otroMercadeoChecked, 
                otroMercadeoValue: formData.otroMercadeo,
                otroMercadeoFinal: formData.otroMercadeoChecked === 'Sí' ? (formData.otroMercadeo || 'Valor vacío') : 'No',
                
                // 'Otras estrategias' y su checkbox
                otroEstrategiasChecked: formData.otroEstrategiasChecked,
                otroEstrategiasValue: formData.otroEstrategias,
                otroEstrategiasFinal: formData.otroEstrategiasChecked === 'Sí' ? (formData.otroEstrategias || '') : 'No',
              });
              
              pasoData = {
                  personasInteresChecked: formData.personasInteresChecked || 'No',
                  personasMatriculadasChecked: formData.personasMatriculadasChecked || 'No',
                  otroInteres: formData.otroInteresChecked === 'Sí' ? (formData.otroInteres || '') : 'No',
                  innovacion: formData.innovacion || 'No',
                  solicitudExterno: formData.solicitudExterno || 'No',
                  interesSondeo: formData.interesSondeo || 'No',
                  otroMercadeo: formData.otroMercadeoChecked === 'Sí' ? (formData.otroMercadeo || 'Valor vacío') : 'No',
                  llamadas: formData.llamadas || 'No',
                  encuestas: formData.encuestas || 'No',
                  webinar: formData.webinar || 'No',
                  pautas_redes: formData.pautas_redes || 'No',
                  otroEstrategias: formData.otroEstrategiasChecked === 'Sí' ? (formData.otroEstrategias || '') : 'No',
                  // Enviar cada campo de preregistro individualmente en lugar de combinarlos
                  preregistroFisico: formData.preregistroFisico || 'No',
                  preregistroGoogle: formData.preregistroGoogle || 'No',
                  preregistroOtro: formData.preregistroOtroChecked === 'Sí' ? (formData.preregistroOtro || '') : 'No',
              };
              break;
          case 3:
              // Debug completo para el paso 4
              console.log('PASO 4 - DATOS COMPLETOS:', {
                // Grupo 1 - Mesas de trabajo
                gremios: formData.gremios,
                sectores_empresariales: formData.sectores_empresariales,
                politicas_publicas: formData.politicas_publicas,
                otros_mesas_trabajoChecked: formData.otros_mesas_trabajoChecked,
                otros_mesas_trabajo: formData.otros_mesas_trabajo,
                
                // Grupo 2 - Actividades de mercadeo
                focusGroup: formData.focusGroup,
                desayunosTrabajo: formData.desayunosTrabajo,
                almuerzosTrabajo: formData.almuerzosTrabajo,
                openHouse: formData.openHouse,
                ferias_colegios: formData.ferias_colegios,
                ferias_empresarial: formData.ferias_empresarial,
                otros_mercadeoChecked: formData.otros_mercadeoChecked,
                otros_mercadeo: formData.otros_mercadeo,
                
                // Grupo 3 - Modalidad y valor económico
                valorEconomico: formData.valorEconomico,
                modalidadPresencial: formData.modalidadPresencial,
                modalidadVirtual: formData.modalidadVirtual,
                modalidadSemipresencial: formData.modalidadSemipresencial,
                traslados_docente: formData.traslados_docente,
                modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia
              });
            
              pasoData = {
                // Grupo 1 - Mesas de trabajo
                gremios: formData.gremios || 'No',
                sectores_empresariales: formData.sectores_empresariales || 'No',
                politicas_publicas: formData.politicas_publicas || 'No',
                otros_mesas_trabajo: formData.otros_mesas_trabajoChecked === 'Sí' ? (formData.otros_mesas_trabajo || '') : 'No',
                
                // Grupo 2 - Actividades de mercadeo
                focusGroup: formData.focusGroup || 'No',
                desayunosTrabajo: formData.desayunosTrabajo || 'No',
                almuerzosTrabajo: formData.almuerzosTrabajo || 'No',
                openHouse: formData.openHouse || 'No',
                ferias_colegios: formData.ferias_colegios || 'No',
                ferias_empresarial: formData.ferias_empresarial || 'No',
                otros_mercadeo: formData.otros_mercadeoChecked === 'Sí' ? (formData.otros_mercadeo || '') : 'No',
                
                // Grupo 3 - Modalidad y valor económico
                valorEconomico: formData.valorEconomico || 'No',
                modalidadPresencial: formData.modalidadPresencial || 'No',
                modalidadVirtual: formData.modalidadVirtual || 'No',
                modalidadSemipresencial: formData.modalidadSemipresencial || 'No',
                traslados_docente: formData.traslados_docente || 'No',
                modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia || 'No',
                
                // Mantener los campos existentes para compatibilidad
                whatsapp: formData.whatsapp === true ? 'Sí' : 'No',
                distribucion_correos: formData.distribucion_correos === true ? 'Sí' : 'No',
                bases_datos: formData.bases_datos === true ? 'Sí' : 'No',
                redes_sociales: formData.redes_sociales === true ? 'Sí' : 'No',
                preregistro: formData.preregistroFisico || formData.preregistroGoogle || formData.preregistroOtro ? 'Sí' : 'No',
                asambleas: formData.asambleas === true ? 'Sí' : 'No',
                stand: formData.stand === true ? 'Sí' : 'No',
                visitas: formData.visitas === true ? 'Sí' : 'No',
                webinar: formData.webinar === true ? 'Sí' : 'No',
                pautas_redes: formData.pautas_redes === true ? 'Sí' : 'No',
                otroEstrategias: formData.otroEstrategias || 'No',
                feria_calendario: formData.feria_calendario === true ? 'Sí' : 'No',
              };
              break;
          case 4:
            // Debug completo para el paso 5
            console.log('PASO 5 - DATOS COMPLETOS:', {
              // Beneficios
              beneficiosTangibles: formData.beneficiosTangibles,
              beneficiosIntangibles: formData.beneficiosIntangibles,
              
              // Públicos potenciales
              particulares: formData.particulares,
              colegios: formData.colegios,
              empresas: formData.empresas,
              egresados: formData.egresados,
              colaboradores: formData.colaboradores,
              otros_publicos_potencialesChecked: formData.otros_publicos_potencialesChecked,
              otros_publicos_potenciales: formData.otros_publicos_potenciales,
              
              // Tendencias y DOFA
              tendenciasActuales: formData.tendenciasActuales,
              dofaDebilidades: formData.dofaDebilidades,
              dofaOportunidades: formData.dofaOportunidades,
              dofaFortalezas: formData.dofaFortalezas,
              dofaAmenazas: formData.dofaAmenazas,
              
              // Canales de divulgación
              paginaWeb: formData.paginaWeb,
              facebook: formData.facebook,
              instagram: formData.instagram,
              linkedin: formData.linkedin,
              correo: formData.correo,
              prensa: formData.prensa,
              boletin: formData.boletin,
              llamadas_redes: formData.llamadas_redes,
              otro_canalChecked: formData.otro_canalChecked,
              otro_canal: formData.otro_canal
            });
            
            pasoData = {
              personasInteresChecked: formData.personasInteresChecked === true ? 'Sí' : 'No',
              personasInteresadas: formData.personasInteresadas || '0',
              personasMatriculadasChecked: formData.personasMatriculadasChecked === true ? 'Sí' : 'No',
              personasMatriculadas: formData.personasMatriculadas || '0',
              observaciones: formData.observaciones || ''
            };
              break;
          default:
              break;
      }

      const pasoDataCompleto = completarValoresConNo(pasoData);

      try {
          // Ver todos los datos que se enviarán al servidor
          console.log('Datos completos del formulario:', formData);
          console.log('Datos del paso que se enviarán al servidor:', pasoDataCompleto);
          
          // Verificación específica de otroMercadeo
          console.log('VERIFICACIÓN CRÍTICA DE otroMercadeo:', {
            checkbox: formData.otroMercadeoChecked,
            valor_original: formData.otroMercadeo,
            valor_procesado: pasoDataCompleto.otroMercadeo
          });
          
          console.log('Enviando datos al servidor:', {
            id_solicitud: idSolicitud,
            ...pasoDataCompleto,
            paso: activeStep + 1,
            hoja: 4,
            id_usuario: userData.id_usuario,
            name: userData.name,
          });
          
          // Use retry logic for API calls to prevent rate limiting
          await retryWithBackoff(() => 
            axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
              id_solicitud: idSolicitud,
              ...pasoDataCompleto,
              paso: activeStep + 1,
              hoja: 4,
              id_usuario: userData.id_usuario,
              name: userData.name,
            })
          );
          
          // Actualizar progreso en el servidor para controlar los pasos disponibles
          await retryWithBackoff(() => updateMaxAllowedStep(activeStep + 1));
          
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    try {
        // Inicializar pasoDataCompleto con todos los datos necesarios
      const completarValoresConNo = (data) => {
          const completado = {};
          for (let key in data) {
              // Si el campo está definido como string y tiene algún contenido, lo dejamos tal cual
              if (typeof data[key] === 'string' && data[key].trim() !== '') {
                  completado[key] = data[key];
              } 
              // Solo convertir a 'No' si es undefined, null o cadena vacía
              else if (data[key] === '' || data[key] === null || data[key] === undefined) {
                  completado[key] = 'No';
              } 
              // Para cualquier otro caso, mantener el valor original
              else {
                  completado[key] = data[key];
              }
          }
          return completado;
      };

        // Compilar todos los datos del formulario para el envío final
        const allFormData = {
            // Paso 1
            descripcionPrograma: formData.descripcionPrograma || 'No',
            identificacionNecesidades: formData.identificacionNecesidades || 'No',
            
            // Paso 2
            atributosBasicos: formData.atributosBasicos || 'No',
            atributosDiferenciadores: formData.atributosDiferenciadores || 'No',
            competencia: formData.competencia || 'No',
            programa: formData.programa || 'No',
            programasSimilares: formData.programasSimilares || 'No',
            estrategiasCompetencia: formData.estrategiasCompetencia || 'No',
            
            // Paso 3
            personasInteresChecked: formData.personasInteresChecked || 'No',
            personasMatriculadasChecked: formData.personasMatriculadasChecked || 'No',
            otroInteres: formData.otroInteresChecked === 'Sí' ? (formData.otroInteres || '') : 'No',
            innovacion: formData.innovacion || 'No',
            solicitudExterno: formData.solicitudExterno || 'No',
            interesSondeo: formData.interesSondeo || 'No',
            otroMercadeo: formData.otroMercadeoChecked === 'Sí' ? (formData.otroMercadeo || 'Valor vacío') : 'No',
            llamadas: formData.llamadas || 'No',
            encuestas: formData.encuestas || 'No',
            webinar: formData.webinar || 'No',
            pautas_redes: formData.pautas_redes || 'No',
            otroEstrategias: formData.otroEstrategiasChecked === 'Sí' ? (formData.otroEstrategias || '') : 'No',
            preregistro: (formData.preregistroFisico === 'Sí' ? 'Físico ' : '') + 
                        (formData.preregistroGoogle === 'Sí' ? 'Google ' : '') + 
                        (formData.preregistroOtroChecked === 'Sí' ? formData.preregistroOtro : '') || 'No',
            
            // Paso 4
            gremios: formData.gremios || 'No',
            sectores_empresariales: formData.sectores_empresariales || 'No',
            politicas_publicas: formData.politicas_publicas || 'No',
            otros_mesas_trabajo: formData.otros_mesas_trabajoChecked === 'Sí' ? (formData.otros_mesas_trabajo || '') : 'No',
            
            focusGroup: formData.focusGroup || 'No',
            desayunosTrabajo: formData.desayunosTrabajo || 'No',
            almuerzosTrabajo: formData.almuerzosTrabajo || 'No',
            openHouse: formData.openHouse || 'No',
            ferias_colegios: formData.ferias_colegios || 'No',
            ferias_empresarial: formData.ferias_empresarial || 'No',
            otros_mercadeo: formData.otros_mercadeoChecked === 'Sí' ? (formData.otros_mercadeo || '') : 'No',
            
            valorEconomico: formData.valorEconomico || 'No',
            modalidadPresencial: formData.modalidadPresencial || 'No',
            modalidadVirtual: formData.modalidadVirtual || 'No',
            modalidadSemipresencial: formData.modalidadSemipresencial || 'No',
            traslados_docente: formData.traslados_docente || 'No',
            modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia || 'No',
            
            // Paso 5
          beneficiosTangibles: formData.beneficiosTangibles || 'No',
          beneficiosIntangibles: formData.beneficiosIntangibles || 'No',
            
          particulares: formData.particulares || 'No',
          colegios: formData.colegios || 'No',
          empresas: formData.empresas || 'No',
          egresados: formData.egresados || 'No',
          colaboradores: formData.colaboradores || 'No',
            otros_publicos_potenciales: formData.otros_publicos_potencialesChecked === 'Sí' ? (formData.otros_publicos_potenciales || '') : 'No',
            
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
            otro_canal: formData.otro_canalChecked === 'Sí' ? (formData.otro_canal || '') : 'No',
        };

        const pasoDataCompleto = completarValoresConNo(allFormData);
        
        // Logging detallado de los campos "otros" para diagnóstico
        console.log('DIAGNÓSTICO DETALLADO DE CAMPOS OTROS EN FINAL:', {
            // otroMercadeo
            otroMercadeoChecked_original: formData.otroMercadeoChecked,
            otroMercadeo_original: formData.otroMercadeo,
            otroMercadeo_procesado: allFormData.otroMercadeo,
            otroMercadeo_final: pasoDataCompleto.otroMercadeo,
            
            // otros_mercadeo (paso 4)
            otros_mercadeoChecked_original: formData.otros_mercadeoChecked,
            otros_mercadeo_original: formData.otros_mercadeo,
            otros_mercadeo_procesado: allFormData.otros_mercadeo,
            otros_mercadeo_final: pasoDataCompleto.otros_mercadeo,
            
            // otros campos con similar estructura
            otroEstrategias_final: pasoDataCompleto.otroEstrategias,
            otroInteres_final: pasoDataCompleto.otroInteres,
            otros_mesas_trabajo_final: pasoDataCompleto.otros_mesas_trabajo,
            otros_publicos_potenciales_final: pasoDataCompleto.otros_publicos_potenciales,
            otro_canal_final: pasoDataCompleto.otro_canal,
        });
        
        console.log('Enviando datos finales del formulario:', {
            id_solicitud: idSolicitud,
            ...pasoDataCompleto,
            paso: 5,
            hoja: 4,
            etapa_actual: 5,
            id_usuario: userData.id_usuario,
            name: userData.name,
        });
        
        // Verificar campos específicos antes del envío final
        console.log('VALIDACIÓN FINAL DE CAMPOS CRÍTICOS:', {
            otroMercadeo: pasoDataCompleto.otroMercadeo,
            otroEstrategias: pasoDataCompleto.otroEstrategias,
            otroInteres: pasoDataCompleto.otroInteres,
            preregistro: pasoDataCompleto.preregistro || 'No se está enviando',
            // Comprobar si los campos que requieren tratamiento especial 
            // tienen el formato correcto
            personasInteresCheckedValue: formData.personasInteresChecked,
            personasInteresadasValue: formData.personasInteresadas,
            personasMatriculadasCheckedValue: formData.personasMatriculadasChecked,
            personasMatriculadasValue: formData.personasMatriculadas
        });
        
        // Verificación específica de otroMercadeo
        console.log('VERIFICACIÓN CRÍTICA FINAL DE otroMercadeo:', {
            checkbox: formData.otroMercadeoChecked,
            valor_original: formData.otroMercadeo,
            valor_procesado: pasoDataCompleto.otroMercadeo
        });
        
        // Use retry logic for API calls to prevent rate limiting
        const response = await retryWithBackoff(() => 
          axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
            id_solicitud: idSolicitud,
            ...pasoDataCompleto,
            paso: 5,
            hoja: 4,
            etapa_actual: 5,
            id_usuario: userData.id_usuario,
            name: userData.name,
          })
        );
        
        console.log('Respuesta del servidor:', response.data);
        
        // Actualizar progreso en el servidor para completar el formulario
        await retryWithBackoff(() => updateMaxAllowedStep(5));
        
          setIsLoading(false); // Finalizar el loading
          setOpenModal(true); // Abre el modal
      } catch (error) {
        console.error('Error al guardar los datos del último paso:', error.response?.data || error.message);
        setIsLoading(false);
        alert('Error al guardar datos. Revisa la consola para más detalles.');
      }
  };

  const handleStepClick = (stepIndex) => {
    if (isStepAllowed(stepIndex)) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si está permitido
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
      await downloadFormReport(idSolicitud, 4); // 4 corresponde al formulario de mercadeo
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
  // OPTIMIZED: Use data already available from the hook instead of making additional API calls
  const isFormCompletedBackend = formularioCompleto || estadoFormularios?.["4"] === "Completado";
  
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
      await downloadFormReport(idSolicitud, 4); // Use form number 4
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
                accessible={isStepAllowed(index)}
              />
            )}
            sx={{
              '& .MuiStepLabel-label': {
                backgroundColor: index === activeStep
                  ? '#0056b3' // Activo: azul oscuro
                  : completedSteps.includes(index)
                    ? '#81bef7' // Completado no activo: azul claro
                    : isStepAllowed(index)
                      ? '#81bef7' // Accesible no completado: azul claro
                      : 'transparent', // No accesible: sin fondo
                color: index === activeStep || isStepAllowed(index) 
                  ? '#FFFFFF' 
                  : '#A0A0A0',
                padding: isStepAllowed(index) ? '5px 10px' : '0',
                borderRadius: '20px',
                fontWeight: index === activeStep ? 'bold' : 'normal',
                cursor: isStepAllowed(index) ? 'pointer' : 'default',
                opacity: isStepAllowed(index) ? 1 : 0.6,
              },
              '& .MuiStepIcon-root': {
                color: index === activeStep
                  ? '#0056b3' // Activo: azul oscuro
                  : completedSteps.includes(index)
                    ? '#81bef7' // Completado no activo: azul claro
                    : isStepAllowed(index)
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
                  await downloadFormReport(idSolicitud, 4);
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

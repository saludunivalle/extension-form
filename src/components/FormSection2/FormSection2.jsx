import { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, CircularProgress} from '@mui/material';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import axios from 'axios'; 
import { useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { openFormReport } from '../../services/reportServices';
import PrintIcon from '@mui/icons-material/Print';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
  

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep }) {
  
  const [activeStep, setActiveStep] = useState(currentStep);  
  const [extraExpenses, setExtraExpenses] = useState([]); 
  const id_usuario = userData?.id_usuario;
  const location = useLocation();
  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); 
  const [isLoading, setIsLoading] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0); 



  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Resumen Financiero'];

  const [totalGastos, setTotalGastos] = useState(0);

  const handleUpdateTotalGastos = (total) => {
    setTotalGastos(total); 
  };

  useEffect(() => {
    console.log('Formulario data recibido: ', formData);
    console.log('Datos del usuario: ', userData);
  }, [formData, userData]);

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      setActiveStep(0); 
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);  

  useEffect(() => {
    if (!idSolicitud || isNaN(parseInt(idSolicitud, 10))) {
      console.log('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      window.location.href = '/';
    }
  }, [idSolicitud]);
  
  /*
    Lógica del botón "Siguiente"
    - Valida los campos del paso actual. Si hay errores, detiene el avance.
    - Construye los datos necesarios (`pasoData`) según el paso activo, incluyendo archivos si aplica.
    - Envía los datos al servidor usando `axios` y maneja errores de la solicitud.
    - Si el envío es exitoso, marca el paso como completado, avanza al siguiente y actualiza el estado del progreso.
  */

    const isValidExpense = (expense) => {
      const cantidad = parseFloat(expense.cantidad) || 0;
      const vr_unit  = parseFloat(expense.vr_unit) || 0;
      return cantidad > 0 && vr_unit > 0;
    };

    const gastosStructure2 = [
      { id_conceptos: '1', label: 'Costos de Personal' },
      { id_conceptos: '1,1', label: 'Personal Nombrado de la Universidad (Max 70%)' },
      { id_conceptos: '1,2', label: 'Honorarios Docentes Externos (Horas)' },
      { id_conceptos: '1.3', label: 'Otro Personal - Subcontratos' },
      { id_conceptos: '2', label: 'Materiales y Suministros' },
      { id_conceptos: '3', label: 'Gastos de Alojamiento' },
      { id_conceptos: '4', label: 'Gastos de Alimentación' },
      { id_conceptos: '5', label: 'Gastos de Transporte' },
      { id_conceptos: '6', label: 'Equipos Alquiler o Compra' },
      { id_conceptos: '7', label: 'Dotación Participantes' },
      { id_conceptos: '7,1', label: 'Carpetas' },
      { id_conceptos: '7,2', label: 'Libretas' },
      { id_conceptos: '7,3', label: 'Lapiceros' },
      { id_conceptos: '7,4', label: 'Memorias' },
      { id_conceptos: '7,5', label: 'Marcadores, papel, etc,' },
      { id_conceptos: '8', label: 'Impresos' },
      { id_conceptos: '8,1', label: 'Labels' },
      { id_conceptos: '8,2', label: 'Certificados' },
      { id_conceptos: '8,3', label: 'Escarapelas' },
      { id_conceptos: '8,4', label: 'Fotocopias' },
      { id_conceptos: '9', label: 'Impresos' },
      { id_conceptos: '9,1', label: 'Estación de café' },
      { id_conceptos: '9,2', label: 'Transporte de mensaje' },
      { id_conceptos: '9,3', label: 'Refrigerios' },
      { id_conceptos: '10', label: 'Inversión en Infraestructura Física' },
      { id_conceptos: '11', label: 'Gastos Generales' },
      { id_conceptos: '12', label: 'Valor Infraestructura Universitaria' },
      { id_conceptos: '13', label: 'Imprevistos (Max 5% del 1 al 8)' },
      { id_conceptos: '14', label: 'Costos Administrativos del proyecto' },
      { id_conceptos: '15', label: 'Gastos Extras' },
    ];

    // En handleSaveGastos
    const handleSaveGastos = async () => {
      // Gastos regulares
      const gastosRegulares = gastosStructure2.map(item => {
        const idKey = item.id_conceptos; // Usa la clave tal cual
        return {
          id_conceptos: idKey,
          cantidad: parseFloat(formData[`${idKey}_cantidad`] || 0),
          valor_unit: parseFloat(formData[`${idKey}_vr_unit`] || 0),
          valor_total: (formData[`${idKey}_cantidad`] || 0) * (formData[`${idKey}_vr_unit`] || 0)
        };
      });
   
      // Ya no necesitamos procesar gastos extras de forma separada
      const todosLosGastos = gastosRegulares.filter(g => g.cantidad > 0 && g.valor_unit > 0);
    
      try {
        const response = await axios.post('https://siac-extension-server.vercel.app/guardarGastos', {
          id_solicitud: formData.id_solicitud.toString(),
          gastos: todosLosGastos
        });
        
        if (response.data.success) {
          console.log("✅ Gastos registrados correctamente");
        }
      } catch (error) {
        console.error("Error:", error.response?.data);
        console.log(`🚨 Error: ${error.response?.data?.error || error.message}`);
      }
    };
  
  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setIsLoading(true);
      const hoja = 2; 
      console.log("Datos del formulario antes de enviar:", formData); 
      
      let pasoData = {};

      switch (activeStep) {
          case 0:
              pasoData = {
                  nombre_actividad: formData.nombre_actividad || '',
                  fecha_solicitud: formData.fecha_solicitud || '',
              };
              break;
              case 1: {
                // Ingresos y Gastos (Paso 2)
                pasoData = {
                  // Ingresos
                  ingresos_cantidad: formData.ingresos_cantidad || '',
                  ingresos_vr_unit: formData.ingresos_vr_unit || '',
                  total_ingresos: (parseFloat(formData.ingresos_cantidad) || 0) * (parseFloat(formData.ingresos_vr_unit) || 0),

                  costos_personal_cantidad: formData['1_cantidad'] || '',
                  costos_personal_vr_unit: formData['1_vr_unit'] || '',
                  total_costos_personal: (parseFloat(formData['1_cantidad']) || 0) * (parseFloat(formData['1_vr_unit']) || 0),

                  personal_universidad_cantidad: formData['1.1_cantidad'] || '',
                  personal_universidad_vr_unit: formData['1.1_vr_unit'] || '',
                  total_personal_universidad: (parseFloat(formData['1.1_cantidad']) || 0) * (parseFloat(formData['1.1_vr_unit']) || 0),
                  
                  honorarios_docentes_cantidad: formData['1.2_cantidad'] || '',
                  honorarios_docentes_vr_unit: formData['1.2_vr_unit'] || '',
                  total_honorarios_docentes: (parseFloat(formData['1.2_cantidad']) || 0) * (parseFloat(formData['1.2_vr_unit']) || 0),

                  otro_personal_cantidad: formData['1.3_cantidad'] || '',
                  otro_personal_vr_unit: formData['1.3_vr_unit'] || '',
                  total_otro_personal: (parseFloat(formData['1.3_cantidad']) || 0) * (parseFloat(formData['1.3_vr_unit']) || 0),

                  materiales_sumi_cantidad: formData['2_cantidad'] || '',
                  materiales_sumi_vr_unit: formData['2_vr_unit'] || '',
                  total_materiales_sumi: (parseFloat(formData['2_cantidad']) || 0) * (parseFloat(formData['2_vr_unit']) || 0),

                  gastos_alojamiento_cantidad: formData['3_cantidad'] || '',
                  gastos_alojamiento_vr_unit: formData['3_vr_unit'] || '',
                  total_gastos_alojamiento: (parseFloat(formData['3_cantidad']) || 0) * (parseFloat(formData['3_vr_unit']) || 0),

                  gastos_alimentacion_cantidad: formData['4_cantidad'] || '',
                  gastos_alimentacion_vr_unit: formData['4_vr_unit'] || '',
                  total_gastos_alimentacion: (parseFloat(formData['4_cantidad']) || 0) * (parseFloat(formData['4_vr_unit']) || 0),

                  // Categoría: Gastos de Transporte
                  gastos_transporte_cantidad: formData['5_cantidad'] || '',
                  gastos_transporte_vr_unit: formData['5_vr_unit'] || '',
                  total_gastos_transporte: (parseFloat(formData['5_cantidad']) || 0) * (parseFloat(formData['5_vr_unit']) || 0),

                  // Categoría: Equipos (Alquiler/Compra)
                  equipos_alquiler_compra_cantidad: formData['6_cantidad'] || '',
                  equipos_alquiler_compra_vr_unit: formData['6_vr_unit'] || '',
                  total_equipos_alquiler_compra: (parseFloat(formData['6_cantidad']) || 0) * (parseFloat(formData['6_vr_unit']) || 0),

                  // Categoría: Dotación de Participantes
                  dotacion_participantes_cantidad: formData['7_cantidad'] || '',
                  dotacion_participantes_vr_unit: formData['7_vr_unit'] || '',
                  total_dotacion_participantes: (parseFloat(formData['7_cantidad']) || 0) * (parseFloat(formData['7_vr_unit']) || 0),

                  // Subcategorías de Dotación de Participantes
                  // Carpetas
                  carpetas_cantidad: formData['7.1_cantidad'] || '',
                  carpetas_vr_unit: formData['7.1_vr_unit'] || '',
                  total_carpetas: (parseFloat(formData['7.1_cantidad']) || 0) * (parseFloat(formData['7.1_vr_unit']) || 0),

                  // Libretas
                  libretas_cantidad: formData['7.2_cantidad'] || '',
                  libretas_vr_unit: formData['7.2_vr_unit'] || '',
                  total_libretas: (parseFloat(formData['7.2_cantidad']) || 0) * (parseFloat(formData['7.2_vr_unit']) || 0),

                  // Lapiceros
                  lapiceros_cantidad: formData['7.3_cantidad'] || '',
                  lapiceros_vr_unit: formData['7.3_vr_unit'] || '',
                  total_lapiceros: (parseFloat(formData['7.3_cantidad']) || 0) * (parseFloat(formData['7.3_vr_unit']) || 0),

                  // Memorias
                  memorias_cantidad: formData['7.4_cantidad'] || '',
                  memorias_vr_unit: formData['7.4_vr_unit'] || '',
                  total_memorias: (parseFloat(formData['7.4_cantidad']) || 0) * (parseFloat(formData['7.4_vr_unit']) || 0),

                  // Marcadores, papel y otros
                  marcadores_papel_otros_cantidad: formData['7.5_cantidad'] || '',
                  marcadores_papel_otros_vr_unit: formData['7.5_vr_unit'] || '',
                  total_marcadores_papel_otros: (parseFloat(formData['7.5_cantidad']) || 0) * (parseFloat(formData['7.5_vr_unit']) || 0),

                  // Categoría: Impresos
                  impresos_cantidad: formData['8_cantidad'] || '',
                  impresos_vr_unit: formData['8_vr_unit'] || '',
                  total_impresos: (parseFloat(formData['8_cantidad']) || 0) * (parseFloat(formData['8_vr_unit']) || 0),

                  // Subcategorías de Impresos
                  // Labels
                  labels_cantidad: formData['8.1_cantidad'] || '',
                  labels_vr_unit: formData['8.1_vr_unit'] || '',
                  total_labels: (parseFloat(formData['8.1_cantidad']) || 0) * (parseFloat(formData['8.1_vr_unit']) || 0),

                  // Certificados
                  certificados_cantidad: formData['8.2_cantidad'] || '',
                  certificados_vr_unit: formData['8.2_vr_unit'] || '',
                  total_certificados: (parseFloat(formData['8.2_cantidad']) || 0) * (parseFloat(formData['8.2_vr_unit']) || 0),

                  // Escarapelas
                  escarapelas_cantidad: formData['8.3_cantidad'] || '',
                  escarapelas_vr_unit: formData['8.3_vr_unit'] || '',
                  total_escarapelas: (parseFloat(formData['8.3_cantidad']) || 0) * (parseFloat(formData['8.3_vr_unit']) || 0),

                  // Fotocopias
                  fotocopias_cantidad: formData['8.4_cantidad'] || '',
                  fotocopias_vr_unit: formData['8.4_vr_unit'] || '',
                  total_fotocopias: (parseFloat(formData['8.4_cantidad']) || 0) * (parseFloat(formData['8.4_vr_unit']) || 0),

                  // Categoría: Otros Impresos
                  otros_impresos_cantidad: formData['9_cantidad'] || '',
                  otros_impresos_vr_unit: formData['9_vr_unit'] || '',
                  total_otros_impresos: (parseFloat(formData['9_cantidad']) || 0) * (parseFloat(formData['9_vr_unit']) || 0),

                  // Subcategorías de Otros Impresos
                  // Estación de Café
                  estacion_cafe_cantidad: formData['9.1_cantidad'] || '',
                  estacion_cafe_vr_unit: formData['9.1_vr_unit'] || '',
                  total_estacion_cafe: (parseFloat(formData['9.1_cantidad']) || 0) * (parseFloat(formData['9.1_vr_unit']) || 0),

                  // Transporte y Mensajería
                  transporte_mensajeria_cantidad: formData['9.2_cantidad'] || '',
                  transporte_mensajeria_vr_unit: formData['9.2_vr_unit'] || '',
                  total_transporte_mensajeria: (parseFloat(formData['9.2_cantidad']) || 0) * (parseFloat(formData['9.2_vr_unit']) || 0),

                  // Refrigerios
                  refrigerios_cantidad: formData['9.3_cantidad'] || '',
                  refrigerios_vr_unit: formData['9.3_vr_unit'] || '',
                  total_refrigerios: (parseFloat(formData['9.3_cantidad']) || 0) * (parseFloat(formData['9.3_vr_unit']) || 0),

                  // Categoría: Infraestructura Física
                  infraestructura_fisica_cantidad: formData['10_cantidad'] || '',
                  infraestructura_fisica_vr_unit: formData['10_vr_unit'] || '',
                  total_infraestructura_fisica: (parseFloat(formData['10_cantidad']) || 0) * (parseFloat(formData['10_vr_unit']) || 0),

                  // Categoría: Gastos Generales
                  gastos_generales_cantidad: formData['11_cantidad'] || '',
                  gastos_generales_vr_unit: formData['11_vr_unit'] || '',
                  total_gastos_generales: (parseFloat(formData['11_cantidad']) || 0) * (parseFloat(formData['11_vr_unit']) || 0),

                  // Categoría: Infraestructura Universitaria
                  infraestructura_universitaria_cantidad: formData['12_cantidad'] || '',
                  infraestructura_universitaria_vr_unit: formData['12_vr_unit'] || '',
                  total_infraestructura_universitaria: (parseFloat(formData['12_cantidad']) || 0) * (parseFloat(formData['12_vr_unit']) || 0),

                  // Imprevistos
                  imprevistos_cantidad: formData['13_cantidad'] || '',
                  imprevistos_vr_unit: formData['13_vr_unit'] || '',
                  total_imprevistos: (parseFloat(formData['13_cantidad']) || 0) * (parseFloat(formData['13_vr_unit']) || 0),

                  // Aportes Univalle
                  costos_administrativos_cantidad: formData['14_cantidad'] || '',
                  costos_administrativos_vr_unit: formData['14_vr_unit'] || '',
                  total_costos_administrativos: (parseFloat(formData['14_cantidad']) || 0) * (parseFloat(formData['14_vr_unit']) || 0),

                  // Gastos Extras
                  gastos_extras: formData['15_cantidad'] || '',
                  gastos_extras_vr_unit: formData['15_vr_unit'] || '',
                  total_gastos_extras: (parseFloat(formData['15_cantidad']) || 0) * (parseFloat(formData['15_vr_unit']) || 0),

                  // Campos calculados (nombre correcto para imprevistos_3%)
                  subtotal_gastos: totalGastos || 0,
                  "imprevistos_3%": (totalGastos * 0.03) || 0,  // Nombre correcto con %
                  total_gastos_imprevistos: (totalGastos * 1.03) || 0,
                  
                  // Distribución de recursos (sin duplicado)
                  fondo_comun_porcentaje: formData.fondo_comun_porcentaje || 30,
                  facultadad_instituto_porcentaje: 5,
                  escuela_departamento_porcentaje: formData.escuela_departamento_porcentaje || 0,
                  total_recursos: totalAportesUnivalle || 0,
                };
                break; 
            }       
          case 2:
              // Resumen Financiero
              pasoData = {
                  fondo_comun: formData.total_ingresos * 0.3,
                  facultad_instituto: formData.total_ingresos * 0.05,
                  escuela_departamento: (formData.total_ingresos * (formData.escuela_departamento_porcentaje || 0) / 100),
              };
              break;
          default:
              break;
      }

      try {
          const dataToSend = {
              id_solicitud: idSolicitud,
              paso: activeStep + 1,
              hoja,
              id_usuario: userData?.id_usuario,
              name: userData?.name,
              ...pasoData,
          };

          // Debugging para asegurar los datos enviados
          console.log("Enviando Datos:", dataToSend);

          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend);
          
          // Mover al siguiente paso si todo fue exitoso
          setIsLoading(false); // Finalizar el loading
          setCompletedSteps((prevCompleted) => {
            const newCompleted = [...prevCompleted];
            if (!newCompleted.includes(activeStep)) {
              newCompleted.push(activeStep);
            }
            return newCompleted;
          });         
          
          if (activeStep === 1) {
            await handleSaveGastos();
          }
        
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

  const handleSubmit = async () => {
    const hoja = 3;
  
    // Resumen Financiero
    const pasoData = {
      fondo_comun: formData.total_ingresos * 0.3,
      facultad_instituto: formData.total_ingresos * 0.05,
      escuela_departamento: (formData.total_ingresos * (formData.escuela_departamento_porcentaje || 0) / 100),
    };
  
    try {
      // Guardar los datos del último paso
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoData,
        paso: 3,
        hoja,
        userData: {
          id_usuario,
          name: userData.name,
        },
      });
  
      setShowModal(true);  // Mostrar el modal cuando se guarda correctamente
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };
  

  /*
    - Renderiza el componente correspondiente al paso actual del formulario basado en el índice del paso (`step`).
    - Proporciona las props necesarias para cada componente, incluyendo datos del formulario y funciones de manejo de eventos.
    - Devuelve `null` si el paso no es válido.
  */

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection2 formData={formData} handleNumberInputChange={handleInputChange} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0} totalGastos={formData.total_gastos || 0} updateTotalGastos={handleUpdateTotalGastos}/>;
      case 2:
        return <Step3FormSection2 formData={formData} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0}  totalAportesUnivalle={totalAportesUnivalle || 0} totalGastos={totalGastos} />;
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
    }
  };

  const PrintReportButton = () => {
      const isFormCompleted = completedSteps.includes(steps.length - 1);
      
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
          right: '-20%', 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
          <Typography 
            variant="caption" 
            color="primary" 
            sx={{ 
              fontSize: '10px', 
              fontWeight: 'bold',
              marginBottom: '10px',
              marginTop: '-10px',
              opacity: !isFormCompleted || isGeneratingReport ? 0.5 : 1 
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
                onClick={() => handleStepClick(index)} // Navegación controlada
                sx={{
                  '& .MuiStepLabel-label': {
                    color: index === activeStep ? '#FFFFFF' : index < activeStep ? '#4F4F4F' : '#A0A0A0', // Blanco activo, gris oscuro completado, gris claro inactivo
                    backgroundColor: index === activeStep ? '#0056b3' : 'transparent', // Fondo azul para paso activo
                    padding: index === activeStep ? '5px 10px' : '0', // Espaciado interno solo en activo
                    borderRadius: '20px', // Bordes redondeados para fondo activo
                    fontWeight: index === activeStep ? 'bold' : 'normal',
                    cursor: index <= highestStepReached ? 'pointer' : 'default', // Cursor pointer solo para pasos alcanzables
                  },
                  '& .MuiStepIcon-root': {
                    color: index < activeStep ? '#0056b3' : '#E0E0E0', // Azul para pasos completados, gris para inactivos
                    fontSize: '28px', // Tamaño del ícono
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#0056b3', // Azul para el ícono del paso activo
                  },
                  '& .MuiStepIcon-text': {
                    fill: '#FFFFFF', // Color blanco para el número del paso activo
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => setShowModal(true) : handleNext} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
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
                      await openFormReport(idSolicitud, 2);
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
    </Box>
  );
}

FormSection2.propTypes = {
  formData: PropTypes.shape({
    nombre_actividad: PropTypes.string,
    fecha_solicitud: PropTypes.string,
    ingresos_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingresos_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ingresos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costos_personal_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costos_personal_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    personal_universidad_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    personal_universidad_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    honorarios_docentes_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    honorarios_docentes_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    otro_personal_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    otro_personal_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setCurrentSection: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  totalAportesUnivalle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FormSection2;
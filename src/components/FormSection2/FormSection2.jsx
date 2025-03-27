import { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, CircularProgress} from '@mui/material';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import axios from 'axios'; 
import useInternalNavigationGoogleSheets from '../../hooks/useInternalNavigationGoogleSheets';
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
  

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep, validateStep }) {
  
  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Resumen Financiero'];

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
  const [totalGastos, setTotalGastos] = useState(0);

  
  const { maxAllowedStep, loading: navLoading, error: navError, isStepAllowed, updateMaxAllowedStep } = 
    useInternalNavigationGoogleSheets(idSolicitud, 2, steps.length);

  const handleUpdateTotalGastos = (total) => {
    setTotalGastos(total); 
  };

  useEffect(() => {
    console.log('Formulario data recibido: ', formData);
    console.log('Datos del usuario: ', userData);
  }, [formData, userData]);

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        // Usar el nuevo endpoint progreso-actual correctamente
        const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
          id_solicitud: idSolicitud,
          etapa_destino: 2, // Formulario 2 (Presupuesto)
          paso_destino: 1   // Información general
        });
        
        if (response.data.success) {
          // Los gastos ahora están dentro de datosFormulario
          const gastos = response.data.estado.datosFormulario?.gastos || [];
          
          if (response.data.success) {
            // Los gastos ahora están dentro de datosFormulario
            const gastos = response.data.estado.datosFormulario?.gastos || [];
            
            if (gastos.length > 0) {
              // Procesar los gastos regulares
              const regularGastos = {};
              const extraGastosList = [];
              
              gastos.forEach(gasto => {
                if (gasto.id_conceptos.startsWith('15.')) {
                  // Es un gasto extra dinámico
                  extraGastosList.push({
                    id: Date.now() + parseInt(gasto.id_conceptos.split('.')[1]),
                    name: gasto.concepto || `Gasto Extra ${gasto.id_conceptos.split('.')[1]}`,
                    cantidad: gasto.cantidad || 0,
                    vr_unit: gasto.valor_unit || 0,
                    key: gasto.id_conceptos
                  });
                } else {
                  // Es un gasto regular
                  regularGastos[`${gasto.id_conceptos}_cantidad`] = gasto.cantidad;
                  regularGastos[`${gasto.id_conceptos}_vr_unit`] = gasto.valor_unit;
                }
              });
              
              // Actualizar estados
              setFormData(prev => ({...prev, ...regularGastos}));
              setExtraExpenses(extraGastosList);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar los gastos:', error);
      }
    };
    
    if (idSolicitud) {
      fetchGastos();
    }
  }, [idSolicitud]);

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
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
      // Obtener los gastos extras del componente hijo
      const gastosExtras = extraExpenses.map((expense, index) => {
        const id_conceptos = `15.${index + 1}`;
        return {
          // Datos para GASTOS
          id_conceptos: id_conceptos,
          concepto: expense.name, 
          cantidad: parseFloat(expense.cantidad || 0),
          valor_unit: parseFloat(expense.vr_unit || 0),
          valor_total: parseFloat(expense.cantidad || 0) * parseFloat(expense.vr_unit || 0),
          concepto_padre: "15", 
          
          // Datos adicionales para CONCEPTOS
          descripcion: expense.name,
          es_padre: false,
          nombre_conceptos: expense.name,
          tipo: "gasto_dinamico",
          id_solicitud: formData.id_solicitud.toString() 
        };
      });
    
      // Gastos regulares (se mantiene igual)
      const gastosRegulares = gastosStructure2.map(item => {
        const idKey = item.id_conceptos;
        return {
          // Datos para GASTOS
          id_conceptos: idKey,
          cantidad: parseFloat(formData[`${idKey}_cantidad`] || 0),
          valor_unit: parseFloat(formData[`${idKey}_vr_unit`] || 0),
          valor_total: (formData[`${idKey}_cantidad`] || 0) * (formData[`${idKey}_vr_unit`] || 0),
          
          // Datos adicionales para CONCEPTOS
          descripcion: item.label,
          es_padre: !idKey.includes(',') && !idKey.includes('.'), // Es padre si no tiene coma en el id_conceptos
          nombre_conceptos: item.label,
          tipo: "gasto_regular",
          id_solicitud: formData.id_solicitud.toString()
        };
      });
    
      // Combinar todos los gastos
      const todosLosGastos = [
        ...gastosRegulares.filter(g => g.cantidad > 0 && g.valor_unit > 0),
        ...gastosExtras.filter(g => g.cantidad > 0 && g.valor_unit > 0)
      ];
    
      try {
        console.log("📊 Datos enviados a guardarGastos:", {
          id_solicitud: formData.id_solicitud.toString(),
          gastos: todosLosGastos,
          actualizarConceptos: true
        });
        
        const response = await axios.post('https://siac-extension-server.vercel.app/guardarGastos', {
          id_solicitud: formData.id_solicitud.toString(),
          gastos: todosLosGastos,
          actualizarConceptos: true,
        });
        
        if (response.data.success) {
          console.log("✅ Gastos registrados correctamente");
        }
      } catch (error) {
        console.error("Error:", error.response?.data);
        console.log(`🚨 Error: ${error.response?.data?.error || error.message}`);
      }
    };

    const handleExtraExpensesChange = (newExtraExpenses) => {
      setExtraExpenses(newExtraExpenses);
    };
    
  
    const handleNext = async () => {
      if (!validateStep()) {
        console.log("Errores en los campos: ");
        return;
      }
  
    setIsLoading(true);
    const hoja = 2;
  
    try {
      if (activeStep === 1) {
        await handleSaveGastos();
      }

      // Luego actualizamos el progreso global usando el nuevo método
      await updateMaxAllowedStep(activeStep + 1);
      
      // Actualizar estado local
      setHighestStepReached((prev) => Math.max(prev, activeStep + 1));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
      alert("Hubo un problema al avanzar al siguiente paso. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
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
        return <Step2FormSection2 
          formData={formData} 
          handleNumberInputChange={handleInputChange} 
          handleInputChange={handleInputChange} 
          totalIngresos={formData.total_ingresos || 0} 
          totalGastos={formData.total_gastos || 0} 
          updateTotalGastos={handleUpdateTotalGastos}
          extraExpenses={extraExpenses}
          onExtraExpensesChange={handleExtraExpensesChange}
        />;
      case 2:
        return <Step3FormSection2 formData={formData} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0}  totalAportesUnivalle={totalAportesUnivalle || 0} totalGastos={totalGastos} />;
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Permite cambiar a pasos ya alcanzados
    }
  };

  const PrintReportButton = () => {
    const isFormCompleted = completedSteps.includes(steps.length - 1);
    
    const handleGenerateReport = async () => {
      try {
        setIsGeneratingReport(true);
        const idSolicitud = localStorage.getItem('id_solicitud');
        await openFormReport(idSolicitud, 2); // 2 para el formulario de presupuesto
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
      {navLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {navError && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error al cargar la información de navegación: {navError.message}
        </Typography>
      )}
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
        <Step key={index} sx={{ marginBottom: '20px' }}>
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
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button variant="contained"
          color="primary" 
          onClick={activeStep === steps.length - 1 ? () => setShowModal(true) : handleNext} 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
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
                <Button 
                  onClick={async () => {
                    try {
                      // Usar el nuevo endpoint para marcar el formulario como completado
                      await axios.post('https://siac-extension-server.vercel.app/actualizacion-progreso', {
                        id_solicitud: idSolicitud,
                        etapa_actual: 2,
                        paso_actual: steps.length,
                        estadoFormularios: {
                          "2": "Completado"
                        }
                      });
                      
                      // Navegar al siguiente formulario
                      setCurrentSection(3);
                    } catch (error) {
                      console.error('Error al actualizar progreso:', error);
                      alert('Hubo un problema al avanzar al siguiente formulario. Por favor intente nuevamente.');
                    }
                  }} 
                  color="primary" 
                  variant="outlined"
                >
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
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setCurrentSection: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  totalAportesUnivalle: PropTypes.number,
  currentStep: PropTypes.number.isRequired,
  validateStep: PropTypes.func.isRequired,
};

export default FormSection2;
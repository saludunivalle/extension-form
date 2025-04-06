import { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, CircularProgress, Alert, AlertTitle, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import WifiOffIcon from '@mui/icons-material/WifiOff'; 
import { styled } from '@mui/system';
import { useLocation } from 'react-router-dom';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import api from '../../services/api';
import useSafeFormNavigation from '../../hooks/useFormNavigation';
import useInternalNavigationGoogleSheets from '../../hooks/useInternalNavigationGoogleSheets';
import { openFormReport, openReportPreview } from '../../services/reportServices';
import axios from 'axios'; 
import PropTypes from 'prop-types';

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
  

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep, validateStep, formId }) {
  
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
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [localFormData, setLocalFormData] = useState({...formData});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  
  const { 
    maxAllowedStep, 
    loading: navLoading, 
    error: navError, 
    isStepAllowed, 
    updateMaxAllowedStep,
  } = useInternalNavigationGoogleSheets(idSolicitud, 2, steps.length);

  const handleUpdateTotalGastos = (total) => {
    setTotalGastos(total); 
  };

  useEffect(() => {
    console.log('Formulario data recibido: ', formData);
    console.log('Datos del usuario: ', userData);
  }, [formData, userData]);

  // 1. Agregar sistema de caché local
const requestCache = {
  data: new Map(),
  timestamp: new Map(),
  ttl: 60000,

  get(key, customTtl = this.ttl) {
    const data = this.data.get(key);
    const timestamp = this.timestamp.get(key);
    
    // Check if data exists and is not expired
    if (data !== undefined && timestamp) {
      if ((Date.now() - timestamp) < customTtl) {
        return data;
      }
    }
    return undefined;
  },
  
  set(key, value) {
    this.data.set(key, value);
    this.timestamp.set(key, Date.now());
    return value;
  }
};

  // 2. Optimizar fetchGastos para usar caché
useEffect(() => {
  const fetchGastos = async () => {
    if (!idSolicitud || formData.gastosCargados) return;
    
    const cacheKey = `gastos_${idSolicitud}`;
    const cachedData = requestCache.get(cacheKey);
    
    if (cachedData) {
      // Usar datos de caché
      const { regularGastos, extraGastosList } = cachedData;
      setFormData(prev => ({...prev, ...regularGastos}));
      setExtraExpenses(extraGastosList);
      return;
    }

    try {
      console.log("📊 Obteniendo gastos desde el servidor...");
      const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
        id_solicitud: idSolicitud,
        etapa_destino: 2,
        paso_destino: 1
      });
      
      if (response.data.success) {
        const gastos = response.data.estado.datosFormulario?.gastos || [];
        
        if (gastos.length > 0) {
          const regularGastos = {};
          const extraGastosList = [];
          
          gastos.forEach(gasto => {
            // Código existente para procesar gastos
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
          setFormData(prev => ({ ...prev, gastosCargados: true }));
          setExtraExpenses(extraGastosList);
          
          // Guardar en caché
          requestCache.set(cacheKey, { regularGastos, extraGastosList });
        }
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
      // Continuar sin datos, mostrar interfaz para ingreso manual
    }
  };
  
  fetchGastos();
}, [idSolicitud, formData.gastosCargados]);

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      // Si currentStep está fuera de rango, intentar recuperar el último paso visitado de localStorage
      const lastVisitedStep = localStorage.getItem(`form2_lastStep_${idSolicitud}`);
      if (lastVisitedStep && !isNaN(parseInt(lastVisitedStep))) {
        setActiveStep(parseInt(lastVisitedStep));
      } else {
        setActiveStep(0); // Valor por defecto si no hay información guardada
      }
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length, idSolicitud]);  

useEffect(() => {
  if (!navLoading && maxAllowedStep !== undefined) {
    console.log('maxAllowedStep:', maxAllowedStep);
    console.log('activeStep:', activeStep);
    console.log('isStepAllowed para siguiente paso:', isStepAllowed(activeStep + 1));
    
    // Recover the highest step previously reached (if exists)
    const savedHighestStep = localStorage.getItem(`form2_highestStep_${idSolicitud}`);
    const previousHighest = savedHighestStep ? parseInt(savedHighestStep) : 0;
    
    // Update the highest step reached considering both maxAllowedStep and the saved value
    const newHighestStep = Math.max(previousHighest, maxAllowedStep);
    setHighestStepReached(newHighestStep);
    
    // Save the new highest step
    localStorage.setItem(`form2_highestStep_${idSolicitud}`, newHighestStep.toString());
  }
}, [maxAllowedStep, navLoading, activeStep, isStepAllowed, idSolicitud]);

  useEffect(() => {
    if (!idSolicitud || isNaN(parseInt(idSolicitud, 10))) {
      console.log('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      window.location.href = '/';
    }
  }, [idSolicitud]);

  useEffect(() => {
    if (idSolicitud) {
      // Guardar el paso actual para poder recuperarlo cuando el usuario vuelva a este formulario
      localStorage.setItem(`form2_lastStep_${idSolicitud}`, activeStep.toString());
    }
  }, [activeStep, idSolicitud]);
  
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
      { id_conceptos: '1,3', label: 'Otro Personal - Subcontratos' },
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
    // 3. Optimizar handleSaveGastos para evitar solicitudes duplicadas
const handleSaveGastos = async () => {
  if (formData.gastosGuardados) return; 
  // Generar clave única para los datos actuales
  const dataChecksum = JSON.stringify(extraExpenses) + JSON.stringify(formData);
  const cacheKey = `saveGastos_${idSolicitud}_${dataChecksum.length}`; // Usar longitud como aproximación simple de checksum
  
  // Verificar si ya enviamos estos datos recientemente (en los últimos 10 segundos)
  const recentlySaved = requestCache.get(cacheKey, 10000);
  if (recentlySaved) {
    console.log("📋 Evitando envío duplicado (datos guardados recientemente)");
    return recentlySaved; // Devolver resultado anterior
  }
  
  // Resto del código actual de handleSaveGastos
  const gastosExtras = extraExpenses.map((expense, index) => {
    const id_conceptos = `15.${index + 1}`;
    return {
      id_conceptos: id_conceptos,
      concepto: expense.name, 
      cantidad: parseFloat(expense.cantidad || 0),
      valor_unit: parseFloat(expense.vr_unit || 0),
      valor_total: parseFloat(expense.cantidad || 0) * parseFloat(expense.vr_unit || 0),
      concepto_padre: "15", 
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
    
    // Asegurar valores mínimos para TODOS los gastos
    let cantidad = parseFloat(formData[`${idKey}_cantidad`] || 0);
    let valor_unit = parseFloat(formData[`${idKey}_vr_unit`] || 0);
    
    // Si ambos valores son 0, asignar un valor mínimo para que aparezca en el reporte
    if (cantidad === 0 && valor_unit === 0) {
      cantidad = 0;
      valor_unit = 0;
    }
    
    return {
      id_conceptos: idKey,
      cantidad: cantidad,
      valor_unit: valor_unit,
      valor_total: cantidad * valor_unit,
      descripcion: item.label,
      es_padre: !idKey.includes(',') && !idKey.includes('.'),
      nombre_conceptos: item.label,
      tipo: "gasto_regular",
      id_solicitud: formData.id_solicitud.toString()
    };
  });
  
  // CAMBIO IMPORTANTE: Modificar el filtro para incluir siempre los IDs especiales
  const gastosRegularesFiltrados = gastosRegulares.filter(g => {
    const tieneValores = g.cantidad > 0 && g.valor_unit > 0;
    return tieneValores;
  });
  
  // Combinar todos los gastos
  let todosLosGastos = [
    ...gastosRegularesFiltrados,
    ...gastosExtras.filter(g => g.cantidad > 0 && g.valor_unit > 0)
  ];
  
  // AÑADIR ESTO: Asegurar que siempre haya al menos un gasto, incluso con valores cero
  if (todosLosGastos.length === 0) {
    // Agregar un gasto predeterminado si no hay ninguno
    todosLosGastos = [{
      id_conceptos: '1',
      cantidad: 1,
      valor_unit: 0,
      valor_total: 0,
      descripcion: 'Costos de Personal',
      es_padre: true,
      nombre_conceptos: 'Costos de Personal',
      tipo: "gasto_regular",
      id_solicitud: formData.id_solicitud?.toString() || idSolicitud
    }];
  }
  
  // También verifica que el ID de solicitud sea válido
  const solicitudId = formData.id_solicitud?.toString() || idSolicitud;
  if (!solicitudId) {
    console.error("Error: ID de solicitud no disponible");
    return { success: false, error: "ID de solicitud no disponible" };
  }
  
  // Generar versiones con coma para compatibilidad con la plantilla
  const gastosParaPlantilla = todosLosGastos.map(gasto => {
    // Crear una copia del objeto
    const gastoConFormatos = {...gasto};
    
    // Si el ID contiene puntos, crear una versión con comas para la plantilla
    if (gasto.id_conceptos.includes('.')) {
      gastoConFormatos.id_conceptos_template = gasto.id_conceptos.replace('.', ',');
    } 
    // Si el ID contiene comas, crear una versión con puntos para el sistema
    else if (gasto.id_conceptos.includes(',')) {
      gastoConFormatos.id_conceptos_sistema = gasto.id_conceptos.replace(',', '.');
    }
    
    return gastoConFormatos;
  });
  
  console.log("📊 Datos preparados para la plantilla:", gastosParaPlantilla);
  
  // Luego continuar con el envío habitual
  try {
    console.log("📊 Datos enviados a guardarGastos:", {
      id_solicitud: formData.id_solicitud.toString(),
      gastos: gastosParaPlantilla,  // Usar la versión con formatos adicionales
      actualizarConceptos: true
    });
    
    const response = await axios.post('https://siac-extension-server.vercel.app/guardarGastos', {
      id_solicitud: solicitudId,
      gastos: gastosParaPlantilla,  // Usar la versión con formatos adicionales
      actualizarConceptos: true,
    });
    
    if (response.data.success) {
      console.log("✅ Gastos registrados correctamente");
      
      // Guardar resultado en caché para evitar envíos duplicados
      requestCache.set(cacheKey, response.data);
      
      return response.data;
    }
  } catch (error) {
    console.error("Error:", error.response?.data);
    console.log(`🚨 Error: ${error.response?.data?.error || error.message}`);
    
    // Guardar datos localmente para reintento posterior
    const localStorageKey = `pendingGastos_${idSolicitud}`;
    localStorage.setItem(localStorageKey, JSON.stringify({
      timestamp: Date.now(),
      gastos: gastosParaPlantilla
    }));
    
    throw error;
  }
};

    const handleExtraExpensesChange = (newExtraExpenses) => {
      setExtraExpenses(newExtraExpenses);
    };
    
  
    // 4. Optimizar handleNext para reducir llamadas y manejar errores sin bloquear flujo
  const handleNext = async () => {
    if (!validateStep()) {
      console.log("Errores en los campos");
      return;
    }

    setIsLoading(true);

    try {
      // Specific logic for step 1 (if needed)
      if (activeStep === 1) {
        try {
          await handleSaveGastos();
        } catch (error) {
          console.warn("Error saving expenses, continuing with local data:", error);
          // Store pending changes for later sync
          localStorage.setItem(`pendingGastos_${idSolicitud}`, 
            JSON.stringify({timestamp: Date.now(), extraExpenses, formData}));
        }
      }

      // Update local progress regardless of server success
      const newHighestStep = Math.max(highestStepReached, activeStep + 1);
      setHighestStepReached(newHighestStep);
      localStorage.setItem(`form2_highestStep_${idSolicitud}`, newHighestStep.toString());
      
      // Try to update progress on server, but don't block UI if it fails
      try {
        if (navigator.onLine) {
          await updateMaxAllowedStep(activeStep + 1);
        }
      } catch (progressError) {
        console.warn("Error updating progress on server, continuing with local progress:", progressError);
      }
      
      // Always advance to next step even if server calls fail
      setActiveStep(activeStep + 1);
      localStorage.setItem(`form2_lastStep_${idSolicitud}`, (activeStep + 1).toString());
      
    } catch (error) {
      console.error("General error:", error);
      // Show a user-friendly message
      alert("Hubo un problema al procesar tu información. Se han guardado los datos localmente y continuarás al siguiente paso.");
      
      // Still advance to next step by falling back to local state
      const newHighestStep = Math.max(highestStepReached, activeStep + 1);
      setHighestStepReached(newHighestStep);
      localStorage.setItem(`form2_highestStep_${idSolicitud}`, newHighestStep.toString());
      setActiveStep(activeStep + 1);
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
  // Validate the form data first
  if (!validateStep()) {
    console.log("Validation failed for the final step");
    return;
  }

  setIsLoading(true); // Start loading indicator
  
  const hoja = 3; // This is form 2
  
  try {
    // Calculate financial summary values
    const ingresos_cantidad = parseInt(formData.ingresos_cantidad) || 0;
    const ingresos_vr_unit = parseInt(formData.ingresos_vr_unit) || 0;
    const total_ingresos = ingresos_cantidad * ingresos_vr_unit;
    
    // Prepare data for the final step
    const pasoData = {
      fondo_comun: Math.round(total_ingresos * 0.3),
      facultad_instituto: Math.round(total_ingresos * 0.05),
      escuela_departamento: Math.round(total_ingresos * (formData.escuela_departamento_porcentaje || 0) / 100),
      total_ingresos: total_ingresos,
      subtotal_gastos: totalGastos || 0,
      imprevistos_3: Math.round((totalGastos || 0) * 0.03),
      total_gastos_imprevistos: Math.round((totalGastos || 0) * 1.03),
      ingresos_cantidad,
      ingresos_vr_unit,
      escuela_departamento_porcentaje: formData.escuela_departamento_porcentaje || 0
    };
    
    console.log("🔍 Valores financieros a enviar:", pasoData);
    
    // IMPORTANTE: Crear objeto FormData o usar JSON dependiendo de lo que espera el servidor
    let dataToSend = new FormData();
    dataToSend.append('id_solicitud', idSolicitud);
    dataToSend.append('paso', 3); // Final step for form 2
    dataToSend.append('hoja', hoja);
    dataToSend.append('etapa_actual', 3); // CAMBIO CRUCIAL: Avanzar a la etapa 3
    dataToSend.append('formulario_completo', 'true'); // Add as string for FormData
    dataToSend.append('id_usuario', userData.id_usuario);
    dataToSend.append('name', userData.name);
    
    // Añadir también estado_formularios con el formulario 2 marcado como completado
    const nuevoEstadoFormularios = { 
      "1": "Completado", 
      "2": "Completado", // Marcar explícitamente como completado
      "3": "En progreso",
      "4": "En progreso" 
    };
    dataToSend.append('estado_formularios', JSON.stringify(nuevoEstadoFormularios));
    
    // Add all fields from pasoData
    Object.keys(pasoData).forEach((key) => {
      if (pasoData[key] !== undefined && pasoData[key] !== null) {
        dataToSend.append(key, pasoData[key]);
      }
    });
    
    // 1. Save main form data with FormData
    const response = await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 2. NUEVO: Actualizar explícitamente el estado de progreso global
    if (response.data && response.data.success) {
      console.log("✅ Form data saved successfully");
      
      try {
        // Actualizar el paso máximo permitido (CRUCIAL)
        if (typeof updateMaxAllowedStep === 'function') {
          await updateMaxAllowedStep(steps.length);
          console.log("✅ Max allowed step updated");
        }
        
        // NUEVO: Envío adicional para actualizar ETAPAS con el estado del formulario
        await axios.post('https://siac-extension-server.vercel.app/actualizacion-progreso-global', {
          id_solicitud: idSolicitud,
          etapa_actual: 3, // Avanzar a formulario 3
          paso_actual: 0,  // Comenzar desde paso inicial
          actualizar_formularios_previos: true, // AÑADIR ESTE PARÁMETRO CRUCIAL
          estado_formularios: nuevoEstadoFormularios // ENVIAR TAMBIÉN EL NUEVO ESTADO
        });
        console.log("✅ Global progress updated");
      } catch (progressError) {
        console.error("Error updating progress state:", progressError);
      }
      
      // Store completion status in localStorage
      localStorage.setItem(`form2_completed_${idSolicitud}`, 'true');
      
      // Show success modal
      setShowModal(true);
    } else {
      console.error("⚠️ Error in server response:", response.data);
      alert("Hubo un problema al guardar los datos. Por favor, inténtelo de nuevo.");
    }
  } catch (error) {
    console.error('Error al guardar el progreso:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } 
    alert("No se pudieron guardar los datos. Por favor, compruebe su conexión e inténtelo de nuevo.");
  } finally {
    setIsLoading(false); // End loading state regardless of outcome
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
    // Verificar si el formulario está completado
    const isFormCompleted = localStorage.getItem(`form2_completed_${idSolicitud}`) === 'true';
    
    if (isFormCompleted || stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Permite cambiar a cualquier paso si el formulario está completado o al paso ya alcanzado
      // Registrar el cambio de paso
      localStorage.setItem(`form2_lastStep_${idSolicitud}`, stepIndex.toString());
    }
  };

  // Modificar la función PrintReportButton en todos los componentes de formulario

// 5. Optimizar PrintReportButton para reducir llamadas al verificar estado
const PrintReportButton = () => {
  const [isFormCompletedBackend, setIsFormCompletedBackend] = useState(false);
  
  useEffect(() => {
    const checkFormCompletion = async () => {
      if (!idSolicitud) return;
      
        try {
          const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
            id_solicitud: idSolicitud,
            etapa_destino: formId || 2,
            paso_destino: 1
          });
          
          if (response.data.success && response.data.estado?.estadoFormularios) {
            const formStatus = response.data.estado.estadoFormularios[formId.toString()];
            setIsFormCompletedBackend(formStatus === 'Completado');

          }
        } catch (error) {
          console.error('Error al verificar estado del formulario:', error);
          // Usar estado local si el servidor no responde
          const localStatus = localStorage.getItem(`form2_completed_${idSolicitud}`);
          setIsFormCompletedBackend(localStatus === 'true');
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
      marginLeft: '20px',
      marginRight: '-70px',
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
      {navLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    <PrintReportButton />
    {isOffline && (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: '#fff3cd', 
        color: '#856404', 
        p: 1, 
        borderRadius: 1,
        mb: 2 
      }}>
        <WifiOffIcon sx={{ mr: 1 }} />
        <Typography variant="body2">
          Modo sin conexión. Los cambios se guardarán localmente.
        </Typography>
      </Box>
    )}
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
                  onClick={() => setCurrentSection(3)} // Cambiar de 2 a 3
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
                      
                      // Marcar el formulario 2 como completado antes de generar el reporte
                      await axios.post('https://siac-extension-server.vercel.app/actualizacion-progreso', {
                        id_solicitud: idSolicitud,
                        etapa_actual: (3),
                        paso_actual: (1),
                        actualizar_formularios_previos: (true), // AÑADIR ESTE PARÁMETRO
                        estado_formularios: {
                          "1": "Completado", 
                          "2": "Completado", // Marcar explícitamente como completado
                          "3": "En progreso",
                          "4": "En progreso"
                        }
                      });
                      
                      await openFormReport(idSolicitud, 2);
                      setCurrentSection(3); // Cambiar de 2 a 3
                    } catch (error) {
                      console.error('Error al generar el reporte:', error);
                      console.error('Status code:', error.response.status);
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
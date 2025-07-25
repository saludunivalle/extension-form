import { useEffect, useState, useCallback } from 'react';
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
import { openFormReport, downloadFormReport, openReportPreview } from '../../services/reportServices';
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
  

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep, validateStep, formId }) {
  
  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Resumen Financiero'];

  const [activeStep, setActiveStep] = useState(currentStep);  
  const [extraExpenses, setExtraExpenses] = useState([]); 
  const id_usuario = userData?.id;
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

  // Define setFormData as a function that updates formData through handleInputChange
  const setFormData = (newDataOrCallback) => {
    // Handle both function and object parameter styles
    if (typeof newDataOrCallback === 'function') {
      const newData = newDataOrCallback(localFormData);
      setLocalFormData(newData);
      // Apply each field individually through handleInputChange
      Object.entries(newData).forEach(([key, value]) => {
        if (key in formData || !(key in localFormData) || formData[key] !== value) {
          handleInputChange({ target: { name: key, value } });
        }
      });
    } else {
      setLocalFormData(prevData => ({...prevData, ...newDataOrCallback}));
      // Apply each field individually through handleInputChange
      Object.entries(newDataOrCallback).forEach(([key, value]) => {
        if (key in formData || !(key in localFormData) || formData[key] !== value) {
          handleInputChange({ target: { name: key, value } });
        }
      });
    }
  };
  
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
    if (!idSolicitud) return;
    
    setIsLoading(true);
    let dataLoaded = false;
    
    try {
      // 1. Check if we already have data in memory cache (most efficient)
      const cacheKey = `gastos_${idSolicitud}`;
      const cachedData = requestCache.get(cacheKey);
      
      // 2. Check localStorage for more persistent cache
      const localStorageData = localStorage.getItem(`solicitud2_gastos_${idSolicitud}`);
      const localStorageTimestamp = localStorage.getItem(`solicitud2_gastos_timestamp_${idSolicitud}`);
      const cacheExpiry = 30 * 60 * 1000; // 30 minutes cache validity
      const now = Date.now();
      const isCacheValid = localStorageTimestamp && (now - parseInt(localStorageTimestamp) < cacheExpiry);
      
      // Variables para almacenar los datos recuperados
      let regularGastos = {};
      let extraGastosList = [];
      
      // 3. Try memory cache first (fastest)
      if (cachedData) {
        console.log("📊 Usando datos de gastos desde caché interna");
        regularGastos = cachedData.regularGastos || {};
        extraGastosList = cachedData.extraGastosList || [];
        dataLoaded = true;
        
        // If cache is still valid, don't make API request
        if (isCacheValid) {
          console.log("📊 Cache still valid, skipping API request");
          setFormData(prev => ({ ...prev, ...regularGastos, gastosCargados: true }));
          setExtraExpenses(extraGastosList);
          setIsLoading(false);
          return;
        }
      } 
      // 4. Try localStorage if memory cache not available
      else if (localStorageData) {
        try {
          console.log("📊 Usando datos de gastos desde localStorage");
          const parsedData = JSON.parse(localStorageData);
          regularGastos = parsedData.regularGastos || {};
          extraGastosList = parsedData.extraGastosList || [];
          dataLoaded = true;
          
          // Apply cached data immediately while we fetch from API
          setFormData(prev => ({ ...prev, ...regularGastos, gastosCargados: true }));
          setExtraExpenses(extraGastosList);
          
          // If cache is still valid, don't make API request
          if (isCacheValid) {
            console.log("📊 Cache still valid, skipping API request");
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error al parsear datos locales:", error);
        }
      }
      
      // 5. Try the API if we don't have valid cache, or if we want to refresh outdated cache
      try {
        console.log("📊 Obteniendo gastos desde el servidor...");
        const apiTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout')), 8000)
        );
        
        // Use Promise.race to implement a timeout
        const response = await Promise.race([
          axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
            id_solicitud: idSolicitud,
            etapa_destino: 2,
            paso_destino: 1
          }),
          apiTimeout
        ]);
        
        if (response.data.success) {
          const gastos = response.data.estado.datosFormulario?.gastos || [];
          const serverTimestamp = response.data.timestamp || Date.now();
          
          if (gastos.length > 0) {
            const serverRegularGastos = {};
            const serverExtraGastosList = [];
            
            gastos.forEach(gasto => {
              // Procesar gastos
              if (gasto.id_conceptos.startsWith('8.')) {
                // Es un gasto extra dinámico
                serverExtraGastosList.push({
                  id: Date.now() + parseInt(gasto.id_conceptos.split('.')[1]),
                  name: gasto.concepto || `Gasto Extra ${gasto.id_conceptos.split('.')[1]}`,
                  cantidad: gasto.cantidad || 0,
                  vr_unit: gasto.valor_unit || 0,
                  key: gasto.id_conceptos
                });
              } else {
                // Es un gasto regular
                serverRegularGastos[`${gasto.id_conceptos}_cantidad`] = gasto.cantidad;
                serverRegularGastos[`${gasto.id_conceptos}_vr_unit`] = gasto.valor_unit;
              }
            });
            
            // Always use server data if available, as it should be authoritative
            // But check if we have newer local modifications
            const useServerData = !localStorageTimestamp || serverTimestamp > parseInt(localStorageTimestamp);
            
            if (useServerData) {
              console.log("📊 Usando datos más recientes del servidor");
              regularGastos = serverRegularGastos;
              extraGastosList = serverExtraGastosList;
            } else {
              console.log("📊 Manteniendo datos locales más recientes");
            }
            
            // Guardar en caché y localStorage
            requestCache.set(cacheKey, { regularGastos, extraGastosList });
            localStorage.setItem(`solicitud2_gastos_${idSolicitud}`, 
                               JSON.stringify({ regularGastos, extraGastosList }));
            localStorage.setItem(`solicitud2_gastos_timestamp_${idSolicitud}`, 
                               now.toString());
            
            dataLoaded = true;
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // API error - use cached data if we have it
        if (dataLoaded) {
          console.log("⚠️ API error but using cached data");
        } else {
          throw apiError; // Rethrow to be caught by outer catch
        }
      }
      
      // 6. Update state with whatever data we have
      if (dataLoaded) {
        setFormData(prev => ({ ...prev, ...regularGastos, gastosCargados: true }));
        setExtraExpenses(extraGastosList);
        console.log("✅ Datos de gastos cargados correctamente");
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
      // Si hay un error, intentar usar los datos de localStorage como respaldo final
      try {
        console.log("⚠️ Intentando usar datos locales como último recurso");
        const localData = localStorage.getItem(`solicitud2_data_${idSolicitud}`);
        const localExtraExpenses = localStorage.getItem(`solicitud2_extraExpenses_${idSolicitud}`);
        
        if (localData) {
          console.log("⚠️ Usando datos locales como respaldo debido a error");
          const parsedData = JSON.parse(localData);
          setFormData(prev => ({ ...prev, ...parsedData, gastosCargados: true }));
        }
        
        if (localExtraExpenses) {
          const parsedExtraExpenses = JSON.parse(localExtraExpenses);
          setExtraExpenses(parsedExtraExpenses);
        }
      } catch (localError) {
        console.error("Error al recuperar datos locales:", localError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchGastos();
  
  // Set up periodic refresh at a reasonable interval (e.g., every 5 minutes)
  // but only if the user is actively interacting with the app
  const refreshInterval = 5 * 60 * 1000; // 5 minutes
  let lastUserActivity = Date.now();
  
  const activityHandler = () => {
    lastUserActivity = Date.now();
  };
  
  // Track user activity
  window.addEventListener('click', activityHandler);
  window.addEventListener('keypress', activityHandler);
  window.addEventListener('scroll', activityHandler);
  
  const intervalId = setInterval(() => {
    // Only refresh if the user has been active in the last 10 minutes
    if (Date.now() - lastUserActivity < 10 * 60 * 1000) {
      fetchGastos();
    }
  }, refreshInterval);
  
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('click', activityHandler);
    window.removeEventListener('keypress', activityHandler);
    window.removeEventListener('scroll', activityHandler);
  };
}, [idSolicitud]);

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

    // Usar la misma estructura jerárquica que en Step2FormSection2
    const gastosStructure2 = [
      { id_conceptos: '1', label: '1. Costos de Personal' },
      { id_conceptos: '1,1', label: '1,1. Personal Nombrado de la Universidad (Max 70%)' },
      { id_conceptos: '1,2', label: '1,2. Honorarios Docentes Externos (Horas)' },
      { id_conceptos: '1,3', label: '1,3. Otro Personal - Subcontratos' },
      { id_conceptos: '2', label: '2. Gastos de alimentación, alojamiento y transporte' },
      { id_conceptos: '2,1', label: '2,1. Gastos de Transporte' },
      { id_conceptos: '2,2', label: '2,2. Gastos de Alimentación' },
      { id_conceptos: '2,3', label: '2,3. Gastos de Alojamiento' },
      { id_conceptos: '3', label: '3. Equipos Alquiler o Compra' },
      { id_conceptos: '3,1', label: '3,1. Alquiler de equipos' },
      { id_conceptos: '3,2', label: '3,2. Compra de equipos' },
      { id_conceptos: '4', label: '4. Materiales y Suministros' },
      { id_conceptos: '4,1', label: '4,1. Libretas' },
      { id_conceptos: '4,2', label: '4,2. Lapiceros' },
      { id_conceptos: '4,3', label: '4,3. Marcadores, papel, etc.' },
      { id_conceptos: '4,4', label: '4,4. Otros materiales' },
      { id_conceptos: '5', label: '5. Impresos' },
      { id_conceptos: '5,1', label: '5,1. Certificados' },
      { id_conceptos: '5,2', label: '5,2. Escarapelas' },
      { id_conceptos: '5,3', label: '5,3. Fotocopias' },
      { id_conceptos: '6', label: '6. Alimentos participantes' },
      { id_conceptos: '6,1', label: '6,1. Estación de café' },
      { id_conceptos: '6,2', label: '6,2. Refrigerios' },
      { id_conceptos: '7', label: '7. Actividades de promoción y publicidad' },
      { id_conceptos: '7,1', label: '7,1. Diseño de piezas gráficas' },
      { id_conceptos: '7,2', label: '7,2. Pautas comerciales' },
      { id_conceptos: '7,3', label: '7,3. Volantes publicitarios' },
      { id_conceptos: '8', label: '8. Otros gastos' }
    ];

    // En handleSaveGastos
    // 3. Optimizar handleSaveGastos para evitar solicitudes duplicadas
const handleSaveGastos = async () => {
  // Validación básica
  if (!idSolicitud) {
    throw new Error("ID de solicitud no disponible");
  }
  
  // Hacer copia para evitar mutaciones accidentales
  const idSolicitudCopy = idSolicitud.toString();
  
  // Generar clave única para los datos actuales
  const dataChecksum = JSON.stringify(extraExpenses) + JSON.stringify(formData);
  const cacheKey = `saveGastos_${idSolicitudCopy}_${dataChecksum.length}`;
  
  // Verificar caché para evitar duplicados
  const recentlySaved = requestCache.get(cacheKey, 10000);
  if (recentlySaved) {
    console.log("📋 Evitando envío duplicado (datos guardados recientemente)");
    return recentlySaved;
  }
  
  // Preparar gastos extras (dinámicos)
  const gastosExtras = extraExpenses
  .filter(isValidExpense)
  .map((expense, index) => {
    const id_conceptos   = `8.${index + 1}`;
    const cantidad       = parseFloat(expense.cantidad  || 0);
    const valor_unit     = parseFloat(expense.vr_unit    || 0);
    const descripcion    = expense.name || `Gasto Extra ${index + 1}`;
    return {
      id_conceptos,                    
      descripcion,                     
      nombre_conceptos: descripcion,   
      es_padre: false,                 
      tipo: 'particular',              
      id_solicitud: idSolicitudCopy,   
      cantidad,
      valor_unit,
      valor_total: cantidad * valor_unit,
      concepto_padre: '8'
    };
  });
  
  // Preparar gastos regulares
  const gastosRegulares = gastosStructure2
  .filter(item => {
    const c = parseFloat(formData[`${item.id_conceptos}_cantidad`] || 0);
    const v = parseFloat(formData[`${item.id_conceptos}_vr_unit`] || 0);
    return c > 0 && v > 0;
  })
  .map(item => {
    const id_conceptos = item.id_conceptos;
    const cantidad     = parseFloat(formData[`${id_conceptos}_cantidad`] || 0);
    const valor_unit   = parseFloat(formData[`${id_conceptos}_vr_unit`] || 0);
    const descripcion  = item.label;
    const esPadre      = !id_conceptos.includes(',');
    const conceptoPadre= esPadre ? id_conceptos : id_conceptos.split(',')[0];
    return {
      id_conceptos,                   
      descripcion,                    
      nombre_conceptos: descripcion,  
      es_padre: esPadre,              
      tipo: 'estándar',              
      id_solicitud: idSolicitudCopy,  
      cantidad,
      valor_unit,
      valor_total: cantidad * valor_unit,
      concepto_padre: conceptoPadre
    };
  });

const todosLosGastos = [...gastosRegulares, ...gastosExtras];
  
  // Si no hay gastos, añadir al menos uno vacío para mantener la estructura
  if (todosLosGastos.length === 0) {
    todosLosGastos.push({
      id_conceptos: '1',
      cantidad: 0,
      valor_unit: 0,
      valor_total: 0,
      descripcion: 'Costos de Personal',
      es_padre: true,
      nombre_conceptos: 'Costos de Personal',
      tipo: "gasto_regular",
      id_solicitud: idSolicitudCopy,
      concepto_padre: '1'
    });
  }
  
  // SIEMPRE guardar localmente primero para garantizar persistencia
  try {
    // Crear una estructura para almacenar en formato para recuperar
    const regularGastos = {};
    gastosRegulares.forEach(gasto => {
      regularGastos[`${gasto.id_conceptos}_cantidad`] = gasto.cantidad;
      regularGastos[`${gasto.id_conceptos}_vr_unit`] = gasto.valor_unit;
    });
    
    // Guardar en localStorage
    localStorage.setItem(
      `solicitud2_gastos_${idSolicitudCopy}`, 
      JSON.stringify({ regularGastos, extraGastosList: extraExpenses })
    );
    localStorage.setItem(
      `solicitud2_gastos_timestamp_${idSolicitudCopy}`,
      Date.now().toString()
    );
    
    console.log("✅ Datos de gastos guardados localmente");
  } catch (localError) {
    console.error("Error al guardar datos localmente:", localError);
  }
  
  try {
    // Enviar al servidor
    const response = await axios.post('https://siac-extension-server.vercel.app/guardarGastos', {
      id_solicitud: idSolicitudCopy,
      gastos: todosLosGastos,
      actualizarConceptos: true
    });
    
    if (response.data.success) {
      console.log("✅ Gastos guardados correctamente en el servidor");
      
      // Guardar resultado en caché para evitar envíos duplicados
      requestCache.set(cacheKey, response.data);
      
      return response.data;
    } else {
      throw new Error(response.data.error || "Error al guardar gastos en el servidor");
    }
  } catch (error) {
    console.error("Error al guardar gastos en el servidor:", error);
    
    // Guardar datos localmente para reintento posterior
    localStorage.setItem(`pendingGastos_${idSolicitudCopy}`, JSON.stringify({
      timestamp: Date.now(),
      gastos: todosLosGastos
    }));
    
    // Devolver un objeto indicando éxito parcial (guardado local)
    return {
      success: true,
      local_only: true,
      message: "Datos guardados localmente. Se sincronizarán cuando haya conexión."
    };
  }
};

    const handleExtraExpensesChange = (newExtraExpenses) => {
      setExtraExpenses(newExtraExpenses);
    };
    
  
    // 4. Optimizar handleNext para reducir llamadas y manejar errores adecuadamente
const handleNext = async () => {
  if (!validateStep()) {
    console.log("Errores en los campos");
    return;
  }

  setIsLoading(true);

  try {
    // Construir datos según el paso actual
    const hoja = 2; // Formulario 2
    let pasoData = {};
    
    switch (activeStep) {
      case 0:
        // Datos del paso 1 (Datos Generales)
        pasoData = {
          nombre_actividad: formData.nombre_actividad || '',
          fecha_solicitud: formData.fecha_solicitud || '',
          // Campo adicional necesario para SOLICITUDES2
          formulario: 'Formulario 2'
        };
        break;
      case 1:
  try {
    // 1. Primero guardar los gastos en la hoja GASTOS
    await handleSaveGastos();
    
    // 2. Obtener los gastos actualizados desde el servidor para calcular el total real
    const gastosResponse = await axios.get('https://siac-extension-server.vercel.app/getGastos', {
      params: { id_solicitud: idSolicitud }
    });
    
    // 3. Calcular el subtotal_gastos como la suma de todos los valor_total
    let subtotal_gastos = 0;
    if (gastosResponse.data && gastosResponse.data.data) {
      subtotal_gastos = gastosResponse.data.data.reduce((sum, gasto) => {
        return sum + parseFloat(gasto.valor_total || 0);
      }, 0);
    } else {
      // Si no hay respuesta, usar el valor calculado localmente como respaldo
      subtotal_gastos = totalGastos || 0;
    }
    
    // 4. Preparar datos para SOLICITUDES2
    const ingresos_cantidad = parseInt(formData.ingresos_cantidad) || 0;
    const ingresos_vr_unit = parseInt(formData.ingresos_vr_unit) || 0;
    const total_ingresos = ingresos_cantidad * ingresos_vr_unit;
    
    // Calcular exactamente 3% para imprevistos
    const imprevistos_3 = subtotal_gastos * 0.03; 
    
    pasoData = {
      ingresos_cantidad: ingresos_cantidad,
      ingresos_vr_unit: ingresos_vr_unit,
      total_ingresos: total_ingresos,
      subtotal_gastos: subtotal_gastos,
      'imprevistos_3%': 3, // Porcentaje fijo
      imprevistos_3: imprevistos_3,
      total_gastos_imprevistos: subtotal_gastos + imprevistos_3,
      diferencia: total_ingresos - (subtotal_gastos + imprevistos_3)
    };
    
    console.log("Guardando en SOLICITUDES2 con subtotal_gastos calculado del servidor:", subtotal_gastos);
  } catch (error) {
    console.warn("Error al guardar gastos, continuando con datos básicos:", error);
    
    // Si falló, usar totalGastos como respaldo
    const ingresos_cantidad = parseInt(formData.ingresos_cantidad) || 0;
    const ingresos_vr_unit = parseInt(formData.ingresos_vr_unit) || 0;
    const total_ingresos = ingresos_cantidad * ingresos_vr_unit;
    
    // Calcular exactamente 3% para imprevistos
    const imprevistos_3 = totalGastos * 0.03; 
    
    pasoData = {
      ingresos_cantidad: ingresos_cantidad,
      ingresos_vr_unit: ingresos_vr_unit,
      total_ingresos: total_ingresos,
      subtotal_gastos: totalGastos || 0,
      'imprevistos_3%': 3, // Porcentaje fijo
      imprevistos_3: imprevistos_3,
      total_gastos_imprevistos: totalGastos + imprevistos_3,
      diferencia: total_ingresos - (totalGastos + imprevistos_3)
    };
  }
  break;
      case 2:
        // Datos del paso 3 (Aportes y Resumen Financiero)
        const ingresos_cantidad_p3 = parseInt(formData.ingresos_cantidad) || 0;
        const ingresos_vr_unit_p3 = parseInt(formData.ingresos_vr_unit) || 0;
        const total_ingresos_p3 = ingresos_cantidad_p3 * ingresos_vr_unit_p3;
        
        // Usar totalGastos calculado previamente para el subtotal
        const subtotal_gastos_p3 = totalGastos || 0;
        const imprevistos_3_p3 = subtotal_gastos_p3 * 0.03;
        const total_gastos_imprevistos_p3 = subtotal_gastos_p3 + imprevistos_3_p3;
        
        // Calcular diferencia
        const diferencia_p3 = total_ingresos_p3 - total_gastos_imprevistos_p3;
        
        // Obtener porcentajes del formulario
        const fondo_comun_porcentaje_p3 = parseFloat(formData.fondo_comun_porcentaje) || 30;
        const facultad_instituto_porcentaje_p3 = parseFloat(formData.facultad_instituto_porcentaje) || 5;
        const escuela_departamento_porcentaje_p3 = parseFloat(formData.escuela_departamento_porcentaje) || 0;
        
        // Calcular valores monetarios
        const fondo_comun_p3 = total_ingresos_p3 * (fondo_comun_porcentaje_p3 / 100);
        const facultad_instituto_p3 = total_ingresos_p3 * (facultad_instituto_porcentaje_p3 / 100);
        const escuela_departamento_p3 = total_ingresos_p3 * (escuela_departamento_porcentaje_p3 / 100);
        const total_recursos_p3 = fondo_comun_p3 + facultad_instituto_p3 + escuela_departamento_p3;
        
        pasoData = {
          // Porcentajes
          fondo_comun_porcentaje: fondo_comun_porcentaje_p3,
          facultad_instituto_porcentaje: facultad_instituto_porcentaje_p3,
          escuela_departamento_porcentaje: escuela_departamento_porcentaje_p3,
          
          // Valores monetarios
          fondo_comun: fondo_comun_p3,
          facultad_instituto: facultad_instituto_p3,
          escuela_departamento: escuela_departamento_p3,
          total_recursos: total_recursos_p3,
          
          // Observaciones
          observaciones: formData.observaciones || ''
        };
        break;
      default:
      break;
    }
  

    // Guardar en caché para evitar duplicados
    const cacheKey = `saveProgress_${idSolicitud}_${activeStep}`;
    const cachedResponse = requestCache.get(cacheKey, 5000); // 5 segundos
    
    if (cachedResponse) {
      console.log("Usando respuesta en caché para evitar duplicados");
    } else {
      console.log(`Enviando datos para el paso ${activeStep + 1}:`, {
        id_solicitud: idSolicitud,
        paso: activeStep + 1,
        hoja: hoja,
        id_usuario: userData?.id || '',
        name: userData?.name || '',
        ...pasoData
      });
      
      // Enviar datos al servidor
      const response = await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        paso: activeStep + 1,
        hoja: hoja,
        id_usuario: userData?.id || '',
        name: userData?.name || '',
        ...pasoData
      });
      
      // Guardar respuesta en caché
      requestCache.set(cacheKey, response.data);
    }

    // Actualizar estado local independientemente del resultado del servidor
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      if (!newCompleted.includes(activeStep)) {
        newCompleted.push(activeStep);
      }
      return newCompleted;
    });
    
    // Actualizar el progreso máximo permitido
    if (typeof updateMaxAllowedStep === 'function') {
      try {
        await updateMaxAllowedStep(activeStep + 1);
      } catch (error) {
        console.warn("Error al actualizar paso máximo:", error);
      }
    }
    
    // Guardar el paso actual en localStorage
    localStorage.setItem(`form2_lastStep_${idSolicitud}`, (activeStep + 1).toString());
    
    // Avanzar al siguiente paso
    setActiveStep(activeStep + 1);
    setHighestStepReached(prev => Math.max(prev, activeStep + 1, maxAllowedStep));
    
  } catch (error) {
    console.error('Error al guardar el progreso:', error);
    
    // Mostrar detalles adicionales del error si están disponibles
    if (error.response && error.response.data) {
      console.error('Detalles del error:', error.response.data);
    }
    
    // Guardar datos localmente para no perderlos
    localStorage.setItem(`form2_data_step${activeStep}_${idSolicitud}`, 
      JSON.stringify(formData));
    
    alert('Hubo un problema al guardar los datos. Se han guardado localmente para intentarlo más tarde.');
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
    if (!validateStep()) {
      console.log("Errores en la validación del paso final");
      return;
    }

    setIsLoading(true);

    try {
      // Resumen financiero
      const ingresos_cantidad = parseInt(formData.ingresos_cantidad) || 0;
      const ingresos_vr_unit = parseInt(formData.ingresos_vr_unit) || 0;
      const total_ingresos = ingresos_cantidad * ingresos_vr_unit;
      
      // Calcular 3% exacto para imprevistos
      const subtotal_gastos = totalGastos || 0;
      const imprevistos_3 = subtotal_gastos * 0.03;
      
      // Calcular valores monetarios basados en porcentajes
      const fondo_comun_porcentaje = parseFloat(formData.fondo_comun_porcentaje) || 30;
      const facultad_instituto_porcentaje = parseFloat(formData.facultad_instituto_porcentaje) || 5; // Ahora editable
      const escuela_departamento_porcentaje = parseFloat(formData.escuela_departamento_porcentaje) || 0;
      
      const fondo_comun = total_ingresos * (fondo_comun_porcentaje / 100);
      const facultad_instituto = total_ingresos * (facultad_instituto_porcentaje / 100);
      const escuela_departamento = total_ingresos * (escuela_departamento_porcentaje / 100);
      const total_recursos = fondo_comun + facultad_instituto + escuela_departamento;
      
      // 1. Primero intentar con el endpoint específico para el paso 3
      try {
        const paso3Response = await axios.post('https://siac-extension-server.vercel.app/guardarForm2Paso3', {
          id_solicitud: idSolicitud,
          id_usuario: userData.id,
          name: userData.name,
          
          // Porcentajes
          fondo_comun_porcentaje: fondo_comun_porcentaje,
          facultad_instituto_porcentaje: facultad_instituto_porcentaje,
          escuela_departamento_porcentaje: escuela_departamento_porcentaje,
          
          // Valores monetarios
          fondo_comun: fondo_comun,
          facultad_instituto: facultad_instituto,
          escuela_departamento: escuela_departamento,
          total_recursos: total_recursos,
          
          // Observaciones
          observaciones: formData.observaciones || '',
          
          // Datos adicionales para contexto (opcionales para el endpoint específico)
          total_ingresos: total_ingresos,
          ingresos_cantidad,
          ingresos_vr_unit,
          subtotal_gastos: subtotal_gastos,
          'imprevistos_3%': 3,
          imprevistos_3: imprevistos_3,
          total_gastos_imprevistos: subtotal_gastos + imprevistos_3,
          diferencia: total_ingresos - (subtotal_gastos + imprevistos_3) // Solo para contexto, no se guardará
        });
        
        console.log('Respuesta del endpoint específico:', paso3Response.data);
        
        if (paso3Response.data && paso3Response.data.success) {
          // Actualizar estado local
          localStorage.setItem(`form2_completed_${idSolicitud}`, 'true');
          
          // Mostrar modal de éxito
          setShowModal(true);
          setIsLoading(false);
          return;
        }
      } catch (endpointError) {
        console.warn('Error al usar endpoint específico, intentando con método general:', endpointError);
        // Continuar con el método general si falla el específico
      }
      
      // 2. Si falla el endpoint específico, usar el método general
      const pasoData = {
        // Porcentajes
        fondo_comun_porcentaje: fondo_comun_porcentaje,
        facultad_instituto_porcentaje: facultad_instituto_porcentaje,
        escuela_departamento_porcentaje: escuela_departamento_porcentaje,
        
        // Valores monetarios
        fondo_comun: fondo_comun,
        facultad_instituto: facultad_instituto,
        escuela_departamento: escuela_departamento,
        total_recursos: total_recursos,
        
        // Observaciones
        observaciones: formData.observaciones || ''
      };
      
      // Envío final con todos los datos
      const dataToSend = new FormData();
      dataToSend.append('id_solicitud', idSolicitud);
      dataToSend.append('paso', 3); // Paso final del formulario 2
      dataToSend.append('hoja', 2);
      dataToSend.append('formulario_completo', 'true');
      dataToSend.append('id_usuario', userData.id);
      dataToSend.append('name', userData.name);
      
      // Añadir estado de formularios
      const nuevoEstadoFormularios = { 
        "1": "Completado", 
        "2": "Completado", 
        "3": "En progreso",
        "4": "En progreso" 
      };
      dataToSend.append('estado_formularios', JSON.stringify(nuevoEstadoFormularios));
      
      // Agregar todos los campos
      Object.keys(pasoData).forEach(key => {
        if (pasoData[key] !== undefined && pasoData[key] !== null) {
          dataToSend.append(key, pasoData[key]);
        }
      });
      
      // Guardar datos finales
      const response = await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend);
      
      if (response.data && response.data.success) {
        // Actualizar estado local
        localStorage.setItem(`form2_completed_${idSolicitud}`, 'true');
        
        // Mostrar modal de éxito
        setShowModal(true);
      } else {
        console.error("Error en respuesta del servidor:", response.data);
        alert("Hubo un problema al guardar los datos. Por favor, inténtelo de nuevo.");
      }
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
      alert("No se pudieron guardar los datos. Por favor, compruebe su conexión e inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
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
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  useEffect(() => {
    const checkFormCompletion = async () => {
      if (!idSolicitud) return;
      
      // Check if we have a recent cached result to avoid unnecessary API calls
      const now = Date.now();
      const cacheKey = `form${formId}_completed_check_${idSolicitud}`;
      const cachedResult = localStorage.getItem(cacheKey);
      
      // Use cached result if it's recent enough
      if (cachedResult && now - lastCheckTime < CACHE_TTL) {
        const parsedResult = JSON.parse(cachedResult);
        setIsFormCompletedBackend(parsedResult.isCompleted);
        console.log("Using cached form completion status");
        return;
      }
      
      // Only proceed with API call if not already checking
      if (isChecking) return;
      
      setIsChecking(true);
      
      try {
        // First try to use cached value from localStorage, even if outdated
        const localStatus = localStorage.getItem(`form${formId}_completed_${idSolicitud}`);
        if (localStatus === 'true') {
          setIsFormCompletedBackend(true);
        }
        
        // Then try to get an updated status from the server
        const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
          id_solicitud: idSolicitud,
          etapa_destino: formId || 2,
          paso_destino: 1
        });
        
        if (response.data.success && response.data.estado?.estadoFormularios) {
          const formStatus = response.data.estado.estadoFormularios[formId.toString()];
          const isCompleted = formStatus === 'Completado';
          
          // Update state and cache the result
          setIsFormCompletedBackend(isCompleted);
          setLastCheckTime(now);
          
          localStorage.setItem(cacheKey, JSON.stringify({
            isCompleted,
            timestamp: now
          }));
          
          // Also update the simpler cache
          localStorage.setItem(`form${formId}_completed_${idSolicitud}`, isCompleted.toString());
        }
      } catch (error) {
        console.error('Error al verificar estado del formulario:', error);
        // Usar estado local si el servidor no responde
        const localStatus = localStorage.getItem(`form${formId}_completed_${idSolicitud}`);
        setIsFormCompletedBackend(localStatus === 'true');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkFormCompletion();
    
    // Set up a periodic check with a reasonable interval
    const checkInterval = setInterval(checkFormCompletion, CACHE_TTL);
    
    return () => clearInterval(checkInterval);
  }, [idSolicitud, formId, isChecking, lastCheckTime]);
  
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
      await downloadFormReport(idSolicitud, formId); // Usar el formId correspondiente
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
      {(navLoading || isChecking) && (
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
  

  // Almacenamiento local para los datos del formulario y gastos extras
useEffect(() => {
  // Función para guardar los datos del formulario en localStorage
  const saveFormDataLocally = () => {
    if (idSolicitud) {
      // Guardar los datos del formulario
      localStorage.setItem(`solicitud2_data_${idSolicitud}`, JSON.stringify(formData));
      
      // Guardar los gastos extras por separado para mejor rendimiento
      localStorage.setItem(`solicitud2_extraExpenses_${idSolicitud}`, JSON.stringify(extraExpenses));
      
      console.log("Datos del formulario guardados localmente");
    }
  };
  
  // Guardar datos automáticamente cuando cambien
  saveFormDataLocally();
  
  // También configurar un intervalo para guardar periódicamente (cada 10 segundos)
  const saveInterval = setInterval(saveFormDataLocally, 10000);
  
  return () => clearInterval(saveInterval);
}, [formData, extraExpenses, idSolicitud]);

// Cargar datos del formulario y gastos extras desde localStorage al inicio
useEffect(() => {
  if (idSolicitud) {
    try {
      // Recuperar datos del formulario
      const savedFormData = localStorage.getItem(`solicitud2_data_${idSolicitud}`);
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prevData => ({...prevData, ...parsedData}));
        console.log("Datos del formulario recuperados desde almacenamiento local");
      }
      
      // Recuperar gastos extras
      const savedExtraExpenses = localStorage.getItem(`solicitud2_extraExpenses_${idSolicitud}`);
      if (savedExtraExpenses) {
        const parsedExtraExpenses = JSON.parse(savedExtraExpenses);
        setExtraExpenses(parsedExtraExpenses);
        console.log("Gastos extras recuperados desde almacenamiento local");
      }
    } catch (error) {
      console.error("Error al recuperar datos guardados localmente:", error);
    }
  }
}, [idSolicitud]);

// Función para guardar datos específicos del paso 3
const saveStep3Data = useCallback(() => {
  if (!idSolicitud) return;
  
  // Extraer solo los campos relevantes para el paso 3
  const step3Data = {
    fondo_comun_porcentaje: formData.fondo_comun_porcentaje,
    escuela_departamento_porcentaje: formData.escuela_departamento_porcentaje,
    observaciones: formData.observaciones,
    responsable_financiero: formData.responsable_financiero
  };
  
  // Guardar en localStorage
  localStorage.setItem(`solicitud2_step3_${idSolicitud}`, JSON.stringify(step3Data));
  console.log("Datos del paso 3 guardados localmente");
}, [idSolicitud, formData.fondo_comun_porcentaje, formData.escuela_departamento_porcentaje, 
    formData.observaciones, formData.responsable_financiero]);

// Llamar a saveStep3Data cuando cambien los campos específicos del paso 3
useEffect(() => {
  if (activeStep === 2) { // Solo guardar cuando estemos en el paso 3
    saveStep3Data();
  }
}, [activeStep, saveStep3Data]);

// Cargar datos del paso 3 cuando se navegue a ese paso
useEffect(() => {
  if (idSolicitud && activeStep === 2) {
    try {
      const savedStep3Data = localStorage.getItem(`solicitud2_step3_${idSolicitud}`);
      if (savedStep3Data) {
        const parsedData = JSON.parse(savedStep3Data);
        setFormData(prevData => ({...prevData, ...parsedData}));
        console.log("Datos del paso 3 recuperados desde almacenamiento local");
      }
    } catch (error) {
      console.error("Error al recuperar datos del paso 3:", error);
    }
  }
}, [idSolicitud, activeStep]);

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


      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button variant="contained"
          color="primary" 
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} 
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
                  onClick={async () => {
                    try {
                      // Primero asegurar que los datos del formulario 2 estén guardados
                      await axios.post('https://siac-extension-server.vercel.app/actualizacion-progreso', {
                        id_solicitud: idSolicitud,
                        etapa_actual: 3,
                        paso_actual: 1,
                        actualizar_formularios_previos: true,
                        estado_formularios: {
                          "1": "Completado", 
                          "2": "Completado",
                          "3": "En progreso",
                          "4": "En progreso"
                        }
                      });
                      setCurrentSection(3); // Cambiar de 2 a 3
                    } catch (error) {
                      console.error('Error al actualizar progreso:', error);
                      // Continuar de todas formas
                      setCurrentSection(3);
                    }
                  }}
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
                      
                      await downloadFormReport(idSolicitud, 2);
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
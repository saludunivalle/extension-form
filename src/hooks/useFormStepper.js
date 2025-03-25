import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar la navegación entre pasos de un formulario
 * @param {Object} config - Configuración del stepper
 * @param {number} config.formId - ID del formulario (1-4)
 * @param {number} config.initialStep - Paso inicial
 * @param {number} config.totalSteps - Total de pasos en el formulario
 * @param {Object} config.formData - Datos del formulario para detectar progreso
 * @returns {Object} - Estados y métodos para manejar la navegación
 */
function useFormStepper({ formId, initialStep = 0, totalSteps, formData }) {
  // Obtener el ID de solicitud del localStorage
  const idSolicitud = localStorage.getItem('id_solicitud');
  
  // Estados del stepper
  const [activeStep, setActiveStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Clave única para este formulario en localStorage
  const storageKey = `form${formId}_${idSolicitud}`;
  
  // Cargar datos guardados al iniciar
  useEffect(() => {
    const loadSavedProgress = () => {
      try {
        // Determine if the entire form has been previously completed
        const isFormCompleted = localStorage.getItem(`form${formId}_completed`) === 'true';
        
        // Load the highest step reached
        const savedHighestStep = localStorage.getItem(`${storageKey}_highestStep`);
        if (savedHighestStep) {
          setHighestStepReached(parseInt(savedHighestStep, 10));
        } else {
          // For new forms, allow only first step
          setHighestStepReached(Math.min(1, totalSteps - 1));
        }
        
        // If form is completed, allow access to all steps
        if (isFormCompleted) {
          setHighestStepReached(totalSteps - 1);
        }
        
        // Load completed steps
        const savedCompletedSteps = localStorage.getItem(`${storageKey}_completedSteps`);
        if (savedCompletedSteps) {
          try {
            const parsedSteps = JSON.parse(savedCompletedSteps);
            if (Array.isArray(parsedSteps)) {
              setCompletedSteps(parsedSteps);
              
              // If form is completed, mark all steps as completed
              if (isFormCompleted) {
                setCompletedSteps(Array.from({ length: totalSteps }, (_, i) => i));
              }
            }
          } catch (e) {
            console.warn("Error parsing completed steps:", e);
          }
        }
        
        // Detect progress based on form data
        detectProgressFromData();
      } catch (error) {
        console.error("Error loading form progress:", error);
      }
    };

    loadSavedProgress();
  }, [idSolicitud, formId]);
  
  // Detectar progreso basado en datos del formulario
  const detectProgressFromData = () => {
    // Esta función debe implementarse según la estructura de cada formulario
    // Por ahora una implementación básica que verifica si hay al menos 3 campos con datos
    if (formData) {
      const fieldsWithData = Object.keys(formData).filter(key => 
        formData[key] && 
        typeof formData[key] === 'string' && 
        formData[key].trim() !== ''
      );
      
      if (fieldsWithData.length > 3) {
        // Si hay datos suficientes, permitir navegación completa
        setHighestStepReached(totalSteps - 1);
      }
    }
  };
  
  // Guardar el paso más alto cuando cambie
  useEffect(() => {
    if (idSolicitud) {
      localStorage.setItem(`${storageKey}_highestStep`, highestStepReached);
    }
  }, [highestStepReached, idSolicitud, storageKey]);
  
  // Guardar pasos completados
  useEffect(() => {
    if (idSolicitud && completedSteps.length > 0) {
      localStorage.setItem(`${storageKey}_completedSteps`, JSON.stringify(completedSteps));
    }
  }, [completedSteps, idSolicitud, storageKey]);
  
  // Funciones para manejar la navegación
  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
      setHighestStepReached(prev => Math.max(prev, activeStep + 1));
      
      // Marcar el paso actual como completado
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps(prev => [...prev, activeStep]);
      }
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };
  
  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex);
    }
  };
  
  // Verificar si un paso es accesible
  const isStepAccessible = (stepIndex) => {
  // Check if the entire form has been completed previously
  const isFormCompleted = localStorage.getItem(`form${formId}_completed`) === 'true';
  
  // If form is completed, all steps are accessible
  if (isFormCompleted) {
    return true;
  }
  
  // Check if user has completed higher form IDs (indicating this form was completed)
  const maxFormIdVisited = localStorage.getItem('maxFormIdVisited') || '1';
  const maxFormId = parseInt(maxFormIdVisited, 10);
  
  if (formId < maxFormId) {
    // Previous forms should be fully accessible
    return true;
  }
  
  // For current form, only allow steps up to highest reached
  return stepIndex <= highestStepReached;
};

  useEffect(() => {
    const currentMaxFormId = localStorage.getItem('maxFormIdVisited') || '1';
    if (formId > parseInt(currentMaxFormId)) {
      localStorage.setItem('maxFormIdVisited', formId.toString());
    }
  }, [formId]);

  const markFormAsCompleted = () => {
    if (idSolicitud) {
      localStorage.setItem(`form${formId}_completed`, 'true');
      
      // Update the maximum form ID visited if this is higher
      const currentMaxFormId = localStorage.getItem('maxFormIdVisited') || '1';
      if (formId > parseInt(currentMaxFormId, 10)) {
        localStorage.setItem('maxFormIdVisited', formId.toString());
      }
      
      // Mark all steps as completed
      const allSteps = Array.from({ length: totalSteps }, (_, i) => i);
      setCompletedSteps(allSteps);
      localStorage.setItem(`${storageKey}_completedSteps`, JSON.stringify(allSteps));
      
      // Set highest step to maximum
      setHighestStepReached(totalSteps - 1);
      localStorage.setItem(`${storageKey}_highestStep`, (totalSteps - 1).toString());
    }
  };
  
  return {
    activeStep,
    setActiveStep,
    completedSteps,
    setCompletedSteps,
    highestStepReached,
    setHighestStepReached,
    isLoading,
    setIsLoading,
    handleNext,
    handleBack,
    handleStepClick,
    isStepAccessible,
    markFormAsCompleted,
  };
}

export default useFormStepper;
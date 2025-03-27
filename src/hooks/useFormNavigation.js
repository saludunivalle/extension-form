import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Hook personalizado para manejar la navegación entre secciones de formularios
 * @param {Object} options - Opciones de configuración
 * @param {string} options.solicitudId - ID de la solicitud actual
 * @param {Object} options.formData - Datos del formulario
 * @param {number} options.initialSection - Sección inicial
 * @param {number} options.initialStep - Paso inicial dentro de la sección
 * @param {number} options.totalSections - Número total de secciones
 */
const useFormNavigation = ({ 
  solicitudId,
  formData,
  initialSection = 1,
  initialStep = 0,
  totalSections = 4
}) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [highestSectionReached, setHighestSectionReached] = useState(1);
  const [formCompletion, setFormCompletion] = useState(
    Array.from({ length: totalSections }, (_, i) => i + 1).reduce((acc, section) => {
      acc[section] = { completed: false, lastStep: 0 };
      return acc;
    }, {})
  );

  // Inferir el nivel de progreso basado en los datos del formulario
  const inferHighestSection = () => {
    if (formData.descripcionPrograma || formData.competencia) {
      return 4;
    } else if (formData.aplicaDiseno1 || formData.proposito) {
      return 3;
    } else if (formData.ingresos_cantidad || formData.total_recursos) {
      return 2;
    } else if (formData.nombre_actividad || formData.introduccion) {
      return 1;
    }
    return 1;
  };

  // Cargar el progreso desde localStorage al inicializar
  useEffect(() => {
    if (solicitudId) {
      // 1. Recuperar la sección más alta alcanzada
      const savedHighestSection = localStorage.getItem(`highestSectionReached_${solicitudId}`);
      const inferredHighestSection = inferHighestSection();
      const highestFromStorage = savedHighestSection ? parseInt(savedHighestSection, 10) : 1;
      
      // Determinar la sección más alta considerando todas las fuentes
      const actualHighestSection = Math.max(
        inferredHighestSection,
        highestFromStorage,
        currentSection
      );

      // Actualizar estado y localStorage
      setHighestSectionReached(actualHighestSection);
      localStorage.setItem(`highestSectionReached_${solicitudId}`, actualHighestSection);
      
      // 2. Cargar información sobre los pasos completados de cada sección
      for (let i = 1; i <= totalSections; i++) {
        const sectionCompletion = localStorage.getItem(`form${i}_completion_${solicitudId}`);
        const lastStep = localStorage.getItem(`form${i}_lastStep_${solicitudId}`);
        
        if (sectionCompletion) {
          setFormCompletion(prev => ({
            ...prev,
            [i]: { 
              completed: sectionCompletion === 'true', 
              lastStep: lastStep ? parseInt(lastStep, 10) : 0 
            }
          }));
        }
      }
    }
  }, [solicitudId, totalSections]);

  // Actualizar sección más alta cuando cambia currentSection
  useEffect(() => {
    if (currentSection > highestSectionReached && solicitudId) {
      setHighestSectionReached(currentSection);
      localStorage.setItem(`highestSectionReached_${solicitudId}`, currentSection);
    }
  }, [currentSection, highestSectionReached, solicitudId]);

  // Función para actualizar el estado de completitud de un formulario
  const updateFormCompletion = (formId, isCompleted, step = null) => {
    if (solicitudId) {
      const newCompletionState = {
        completed: isCompleted,
        lastStep: step !== null ? step : formCompletion[formId]?.lastStep || 0
      };
      
      setFormCompletion(prev => ({
        ...prev,
        [formId]: newCompletionState
      }));
      
      localStorage.setItem(`form${formId}_completion_${solicitudId}`, isCompleted);
      if (step !== null) {
        localStorage.setItem(`form${formId}_lastStep_${solicitudId}`, step);
      }
    }
  };

  // Función para navegar entre secciones
  const navigateToSection = async (newSection) => {
    if (newSection < 1 || newSection > totalSections) return;
    
    try {
      // Validar navegación con el nuevo endpoint
      const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
        id_solicitud: solicitudId,
        etapa_destino: newSection,
        paso_destino: 1
      });
      
      if (response.data.success && response.data.puedeAvanzar) {
        // Guardar el paso actual de la sección que abandonamos
        if (currentSection && solicitudId) {
          localStorage.setItem(`form${currentSection}_lastStep_${solicitudId}`, currentStep);
        }
        
        // Recuperar el último paso visitado de la sección a la que vamos
        const lastStep = solicitudId ? 
          parseInt(localStorage.getItem(`form${newSection}_lastStep_${solicitudId}`) || '0', 10) : 0;
        
        // Actualizar estados
        setCurrentSection(newSection);
        setCurrentStep(lastStep);
        
        // Actualizar URL
        navigate(`/formulario/${newSection}?solicitud=${solicitudId}&paso=${lastStep}`);
      } else {
        // Mostrar mensaje de error
        alert(response.data.mensaje || 'No puede avanzar a esta sección en este momento.');
      }
    } catch (error) {
      console.error('Error al validar navegación:', error);
      alert('Hubo un problema al verificar si puede avanzar a esta sección. Por favor, inténtelo de nuevo.');
    }
  };

  // Función para calcular los pasos completados (para el FormStepper)
  const calculateCompletedSteps = () => {
    return Array.from({ length: highestSectionReached }, (_, i) => i);
  };

  return {
    currentSection,
    setCurrentSection,
    currentStep,
    setCurrentStep,
    highestSectionReached,
    formCompletion,
    navigateToSection,
    updateFormCompletion,
    calculateCompletedSteps,
    // Array de secciones clickeables para el Stepper
    clickableSteps: Array.from({ length: highestSectionReached }, (_, i) => i),
  };
};

export default useFormNavigation;
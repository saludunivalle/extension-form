import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://siac-extension-server.vercel.app';

function useInternalNavigationGoogleSheets(idSolicitud, formNumber, totalSteps) {
  const [maxAllowedStep, setMaxAllowedStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [etapaActual, setEtapaActual] = useState(0);
  const [pasoActual, setPasoActual] = useState(0);
  const [formularioCompleto, setFormularioCompleto] = useState(false);

  // Inicializar con datos del localStorage como respaldo
  useEffect(() => {
    if (idSolicitud) {
      const savedHighestStep = localStorage.getItem(`form${formNumber}_highestStep_${idSolicitud}`);
      if (savedHighestStep) {
        console.log(`🔄 Inicializando con datos en caché: Paso máximo ${savedHighestStep}`);
        setMaxAllowedStep(parseInt(savedHighestStep, 10));
      }
    }
  }, [idSolicitud, formNumber]);

  // Efecto para obtener datos del servidor
  useEffect(() => {
    if (!idSolicitud) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function fetchNavigationData() {
      try {
        console.log(`🔍 Consultando datos de navegación para formulario ${formNumber}`);
        
        const response = await axios.get(`${API_URL}/getSolicitud`, {
          params: { id_solicitud: idSolicitud },
          signal: controller.signal,
          timeout: 15000
        });

        if (!isMounted) return;

        if (response.status === 200 && response.data) {
          // Mostrar la respuesta completa para debug
          console.log("📊 Respuesta completa del servidor:", response.data);
          
          // --- NUEVA LÓGICA DE DETECCIÓN DE ETAPA ACTUAL Y PROGRESO ---
          
          // 1. Detectar qué formularios existen en la respuesta
          const formulariosExistentes = [];
          for (let i = 1; i <= 5; i++) {
            if (response.data[`SOLICITUDES${i === 1 ? '' : i}`]) {
              formulariosExistentes.push(i);
            }
          }
          
          console.log(`📋 Formularios detectados en respuesta: ${formulariosExistentes.join(', ')}`);
          
          // 2. Inferir la etapa actual (el último formulario disponible)
          const etapa_detectada = Math.max(...formulariosExistentes, 0);
          
          // 3. Determinar si este formulario está completo
          let formularioEstaCompleto = false;
          
          // Si existe un formulario posterior, este está completo
          if (formulariosExistentes.some(num => num > formNumber)) {
            formularioEstaCompleto = true;
          }
          
          // 4. Determinar el paso actual para el formulario actual
          let paso_detectado = 1; // Por defecto asumimos al menos el paso 1
          
          // Si estamos en el formulario actual y hay datos, tratamos de inferir el paso
          if (formNumber === etapa_detectada) {
            const formularioData = response.data[`SOLICITUDES${formNumber === 1 ? '' : formNumber}`];
            
            // Contar campos completados para inferir el progreso
            if (formularioData) {
              const camposCompletados = Object.keys(formularioData).filter(
                key => formularioData[key] !== '' && 
                      formularioData[key] !== null && 
                      formularioData[key] !== undefined
              ).length;
              
              // Asumimos que cada 3-5 campos es un paso completado (ajustar según tu formulario)
              paso_detectado = Math.max(1, Math.min(totalSteps, Math.ceil(camposCompletados / 4)));
              console.log(`🔢 Campos completados: ${camposCompletados}, infiriendo paso: ${paso_detectado}`);
            }
          }
          
          setEtapaActual(etapa_detectada);
          setPasoActual(paso_detectado);
          setFormularioCompleto(formularioEstaCompleto);

          console.log(`📊 Navegación inferida:
          - Formulario solicitado: ${formNumber}
          - Etapa detectada: ${etapa_detectada}
          - Paso inferido: ${paso_detectado}
          - Este formulario completo: ${formularioEstaCompleto}
          - Total pasos en este form: ${totalSteps}`);

          // LÓGICA PRINCIPAL DE NAVEGACIÓN
          if (formularioEstaCompleto || formNumber < etapa_detectada) {
            console.log(`✅ Formulario ${formNumber} completado o anterior. Navegación total permitida.`);
            setMaxAllowedStep(totalSteps - 1);
          } 
          else if (formNumber === etapa_detectada) {
            console.log(`🔄 Estamos en el formulario actual (${etapa_detectada}). Permitir hasta paso ${paso_detectado}.`);
            setMaxAllowedStep(Math.max(0, paso_detectado - 1));
          } 
          else {
            console.log(`🔒 Formulario ${formNumber} es posterior. Restricción de navegación.`);
            setMaxAllowedStep(0);
          }
          
          // Guardar en localStorage
          const valorAGuardar = formularioEstaCompleto || formNumber < etapa_detectada 
            ? (totalSteps - 1) 
            : (formNumber === etapa_detectada ? Math.max(0, paso_detectado - 1) : 0);
            
          localStorage.setItem(`form${formNumber}_highestStep_${idSolicitud}`, valorAGuardar.toString());
        } else {
          console.warn("⚠️ Respuesta del servidor sin datos esperados:", response);
        }
        
        setError(null);
      } catch (err) {
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          console.log('Solicitud cancelada intencionalmente, ignorando error');
          return;
        }
        
        console.warn(`❌ Error al obtener datos de navegación:`, err);
        
        if (isMounted && !err.message.includes('canceled')) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNavigationData();

    // Cleanup al desmontar
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [idSolicitud, formNumber, totalSteps]);

  // Función para verificar si se puede acceder a un paso
  const isStepAllowed = (step) => {
    console.log(`🔍 Comprobando paso ${step} - Max permitido: ${maxAllowedStep}`);
    
    if (formularioCompleto || formNumber < etapaActual) {
      return true;
    }
    else if (formNumber === etapaActual) {
      return step <= maxAllowedStep;
    }
    else {
      return step === 0;
    }
  };

  return { 
    maxAllowedStep, 
    loading, 
    error, 
    isStepAllowed,
    etapaActual,
    pasoActual,
    formularioCompleto,
    updateMaxAllowedStep: (newStep) => {
      setMaxAllowedStep(prev => {
        const updatedStep = Math.max(prev, newStep);
        localStorage.setItem(`form${formNumber}_highestStep_${idSolicitud}`, updatedStep.toString());
        return updatedStep;
      });
    }
  };
}

export default useInternalNavigationGoogleSheets;
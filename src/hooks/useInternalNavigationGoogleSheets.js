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
  const [estadoFormularios, setEstadoFormularios] = useState({});

  // Efecto para obtener datos del servidor usando el nuevo endpoint
  useEffect(() => {
    if (!idSolicitud) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function fetchNavigationData() {
      try {
        console.log(`🔍 Consultando progreso actual para formulario ${formNumber}`);
        
        const response = await axios.post(`${API_URL}/progreso-actual`, {
          id_solicitud: idSolicitud,
          etapa_destino: formNumber,
          paso_destino: 1 // Consultamos el paso 0 para obtener la información general
        }, {
          signal: controller.signal,
          timeout: 15000
        });

        if (!isMounted) return;

        if (response.data.success) {
          const { estado } = response.data;
          console.log("📊 Estado de progreso recibido:", estado);
          
          // Actualizar estados con la información del servidor
          setEtapaActual(estado.etapaActual);
          setPasoActual(estado.pasoActual);
          setEstadoFormularios(estado.estadoFormularios);
          
          // Determinar si este formulario está completo
          setFormularioCompleto(estado.estadoFormularios[formNumber] === "Completado");
          
          // Determinar el paso máximo permitido
          let nuevoMaxAllowedStep = 0;
          
          // Si el formulario está completado o es anterior al actual, permitir todos los pasos
          if (estado.estadoFormularios[formNumber] === "Completado" || formNumber < estado.etapaActual) {
            nuevoMaxAllowedStep = totalSteps - 1;
          } 
          // Si estamos en el formulario actual, permitir hasta el paso actual
          else if (formNumber === estado.etapaActual) {
            nuevoMaxAllowedStep = Math.max(0, estado.pasoActual - 1);
          }
          
          console.log(`📊 Navegación actualizada:
          - Formulario solicitado: ${formNumber}
          - Etapa actual: ${estado.etapaActual}
          - Paso actual: ${estado.pasoActual}
          - Este formulario completo: ${estado.estadoFormularios[formNumber] === "Completado"}
          - Máximo paso permitido: ${nuevoMaxAllowedStep}`);
          
          setMaxAllowedStep(nuevoMaxAllowedStep);
          setError(null);
        } else {
          console.warn("⚠️ Respuesta del servidor sin éxito:", response.data);
          setError({ message: response.data.mensaje || "Error al obtener el progreso" });
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          console.log('Solicitud cancelada intencionalmente, ignorando error');
          return;
        }
        
        console.warn(`❌ Error al obtener datos de navegación:`, err);
        
        if (isMounted) {
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

  // Función actualizada para verificar si se puede acceder a un paso
  const isStepAllowed = (step) => {
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

  // Función actualizada para actualizar el paso máximo usando el nuevo endpoint
  const updateMaxAllowedStep = async (newStep) => {
    try {
      console.log(`🔄 Actualizando progreso: Formulario ${formNumber}, Paso ${newStep}`);
      
      const response = await axios.post(`${API_URL}/actualizacion-progreso`, {
        id_solicitud: idSolicitud,
        etapa_actual: formNumber,
        paso_actual: newStep
      });
      
      if (response.data.success) {
        console.log("✅ Progreso actualizado correctamente:", response.data.data);
        
        // Actualizar estados con la respuesta actualizada
        setMaxAllowedStep(Math.max(maxAllowedStep, newStep - 1));
        setEtapaActual(response.data.data.etapa_actual);
        setPasoActual(response.data.data.paso_actual);
        setEstadoFormularios(response.data.data.estado_formularios);
        setFormularioCompleto(response.data.data.estado_formularios[formNumber] === "Completado");
        
        return response.data.data;
      } else {
        console.warn("⚠️ Error al actualizar progreso:", response.data.message);
        throw new Error(response.data.message || "Error al actualizar progreso");
      }
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      throw error;
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
    estadoFormularios,
    updateMaxAllowedStep
  };
}

export default useInternalNavigationGoogleSheets;
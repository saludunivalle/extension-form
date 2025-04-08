import axios from 'axios';
import { toast } from 'react-toastify';
import { report1Config } from './reports/config/report1Config';
import { report2Config } from './reports/config/report2Config';
import { report3Config } from './reports/config/report3Config';

const API_URL = 'https://siac-extension-server.vercel.app';

/**
 * Obtiene la configuración adecuada según el número de formulario
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Object} - Configuración específica del formulario
 */
const getReportConfigByForm = (formNumber) => {
  switch (formNumber) {
    case 1:
      return report1Config;
    case 2:
      return report2Config; 
    case 3:
      return report3Config;
    default:
      return {}; // Configuración vacía por defecto
  }
};

/**
 * Genera un reporte para un formulario específico de una solicitud y abre directamente el enlace de Drive
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Promise<string>} - URL del reporte generado
 */
export const generateFormReport = async (solicitudId, formNumber) => {
  try {
    if (!solicitudId || !formNumber) {
      throw new Error("Información incompleta para generar el reporte");
    }

    // 1. Verificar manualmente los datos que realmente llegan al frontend:
    const verificationResponse = await axios.get(`${API_URL}/getSolicitud`, {
      params: { id_solicitud: solicitudId }
    });
    
    // Analizar campos específicos
    const verificacionDatos = verificationResponse.data || {};
    
    console.log("🧪 VERIFICACIÓN PREVIA AL REPORTE:");
    console.log("- Campos principales:", {
      nombre_actividad: verificacionDatos.nombre_actividad,
      fecha_solicitud: verificacionDatos.fecha_solicitud,
      ingresos_cantidad: verificacionDatos.ingresos_cantidad,
      ingresos_vr_unit: verificacionDatos.ingresos_vr_unit
    });

    // Obtener la configuración específica para este formulario
    const reportConfig = getReportConfigByForm(formNumber);
    console.log(`📄 Generando reporte para Solicitud ID: ${solicitudId}, Formulario: ${formNumber}`);

    // Obtener los datos del formulario para aplicar transformaciones
    let formData = {};
    if (reportConfig.transformData) {
      try {
        const dataResponse = await axios.get(`${API_URL}/getSolicitud`, {
          params: { id_solicitud: solicitudId }
        });
        
        if (dataResponse.data) {
          // Aplicar transformaciones específicas para este formulario
          formData = reportConfig.transformData(dataResponse.data);
        }
      } catch (error) {
        console.error('Error al obtener datos para transformación:', error);
      }
    }

    // Obtener datos locales guardados (como respaldo)
    const localStorageKey = `solicitud2_data_${solicitudId}`;
    const localData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');

    // Solicitar el enlace de Drive al backend incluyendo TODOS los datos disponibles
    const response = await axios.post(`${API_URL}/report/generateReport`, {
      solicitudId,
      formNumber,
      config: reportConfig,
      formData: {
        ...formData,
        ...localData,  // Incluir datos locales como respaldo
      }
    });
    
    // Verificar si la respuesta contiene un enlace directo a Drive
    if (response.status === 500) {
      throw new Error('Error interno del servidor al generar el reporte');
    }

    if (response.data && response.data.link) {
      console.log(`✅ Enlace a Drive generado: ${response.data.link}`);
      return response.data.link;
    } else {
      console.log('⚠️ No se recibió un enlace de Drive, intentando ruta alternativa');
      
      // Método de respaldo: intentar con otra ruta del API
      const respaldoResponse = await axios.get(`${API_URL}/getDriveLink/${solicitudId}/${formNumber}`);
      
      if (respaldoResponse.data && respaldoResponse.data.link) {
        console.log(`✅ Enlace a Drive (respaldo) generado: ${respaldoResponse.data.link}`);
        return respaldoResponse.data.link;
      }
      
      throw new Error('No se recibió un enlace válido para el reporte');
    }
  } catch (error) {
    console.error(`Error al generar el informe para el formulario ${formNumber}:`, error);
    throw error;
  }
};

/**
 * Genera una previsualización del reporte sin crear el documento final
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Promise<Object|null>} - Datos de previsualización o null si hay error
 */
export const previewFormReport = async (solicitudId, formNumber) => {
  try {
    if (!solicitudId || !formNumber) {
      throw new Error("Información incompleta para previsualizar el reporte");
    }
    
    console.log(`🔍 Previsualizando reporte para Solicitud ID: ${solicitudId}, Formulario: ${formNumber}`);
    
    // Obtener la configuración específica para este formulario
    const reportConfig = getReportConfigByForm(formNumber);
    
    // Obtener los datos del formulario para aplicar transformaciones
    let formData = {};
    try {
      const dataResponse = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: solicitudId }
      });
      
      if (dataResponse.data) {
        // Aplicar transformaciones específicas para este formulario
        formData = reportConfig.transformData(dataResponse.data);
      }
    } catch (error) {
      console.error('Error al obtener datos para la previsualización:', error);
    }
    
    // Solicitar la previsualización al backend
    const response = await axios.post(`${API_URL}/report/previewReport`, {
      solicitudId,
      formNumber,
      config: reportConfig,
      formData
    });
    
    // Mostrar en consola para desarrollo
    console.log('✅ Previsualización del reporte generada:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al previsualizar el reporte:', error);
    return null;
  }
}

/**
 * Abre un reporte en una nueva pestaña y muestra una notificación
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const openFormReport = async (solicitudId, formNumber) => {
  const maxRetries = 5;
  let retryCount = 0;
  
  // Función para mostrar notificación de espera
  const showWaitingNotification = (attempt) => {
    toast.info(
      attempt > 0 
        ? `Reintentando generar reporte (intento ${attempt}/${maxRetries})... Esto puede tomar hasta 1 minuto.`
        : `Generando reporte. Espere por favor, esto puede tomar hasta 1 minuto...`, 
      { autoClose: 50000 }
    );
  };
  
  // Mostrar notificación inicial
  showWaitingNotification(0);
  
  // Esperar 10 segundos antes del primer intento para evitar saturar la API
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  while (retryCount < maxRetries) {
    try {
      // Generar el reporte
      const reportUrl = await generateFormReport(solicitudId, formNumber);
      
      if (reportUrl) {
        // Abrir en nueva pestaña
        window.open(reportUrl, '_blank');
        
        // Mostrar notificación de éxito
        toast.success(`Reporte generado exitosamente!`, {
          position: "top-right",
          autoClose: 5000
        });
        return true;
      } else {
        throw new Error('No se recibió una URL válida');
      }
    } catch (error) {
      console.error(`Error al generar el reporte (intento ${retryCount + 1}):`, error);
      retryCount++;
      
      if (retryCount < maxRetries) {
        // Mostrar notificación de espera para el próximo intento
        showWaitingNotification(retryCount);
        
        // Esperar 60 segundos (1 minuto) antes de reintentar para evitar límites de la API
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        // Mensaje de error final después de todos los intentos
        toast.error(`No se pudo generar el reporte después de ${maxRetries} intentos. Por favor intente más tarde.`, {
          position: "top-right",
          autoClose: 8000
        });
      }
    }
  }
  
  return false;
};

/**
 * Abre una previsualización del reporte en un modal
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @param {function} onPreviewReady - Función callback que recibe los datos de previsualización
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const openReportPreview = async (solicitudId, formNumber, onPreviewReady) => {
  try {
    console.log(`🔍 Solicitando previsualización del formulario ${formNumber}...`);
    
    // Convertir a números por seguridad
    const formNum = parseInt(formNumber, 10);
    const idSol = solicitudId.toString();
    
    // Mostrar indicador de carga (puede implementarse en el componente que llama a esta función)
    const previewData = await previewFormReport(idSol, formNum);
    
    if (!previewData) {
      throw new Error('No se pudieron obtener datos para la previsualización');
    }
    
    console.log(`✅ Previsualización generada exitosamente para formulario ${formNum}`);
    
    // Llamar al callback con los datos obtenidos
    if (typeof onPreviewReady === 'function') {
      onPreviewReady(previewData);
    }
    
    return true;
  } catch (error) {
    console.error('Error al generar la previsualización:', error);
    alert('No se pudo generar la previsualización del reporte. Intente más tarde.');
    return false;
  }
};
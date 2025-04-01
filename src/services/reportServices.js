import axios from 'axios';
import { report1Config } from './reports/config/report1Config';
import { report2Config } from './reports/config/report2Config';

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

    // Solicitar el enlace de Drive al backend incluyendo datos transformados
    const response = await axios.post(`${API_URL}/report/generateReport`, {
      solicitudId,
      formNumber,
      config: reportConfig,
      formData // Incluir datos transformados
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
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Log el intento actual si es un reintento
      if (retryCount > 0) {
        console.log(`📄 Intento #${retryCount + 1} de generar reporte para formulario ${formNumber}...`);
      }

      const reportUrl = await generateFormReport(solicitudId, formNumber);

      if (reportUrl) {
        // Abrir la URL en una nueva pestaña
        window.open(reportUrl, '_blank');
        alert(`Informe generado exitosamente para el formulario ${formNumber}`);
        return true;
      } else {
        throw new Error('No se recibió una URL válida para el reporte');
      }
    } catch (error) {
      console.error(`Error al generar el reporte (intento ${retryCount + 1}):`, error);
      retryCount++;

      if (retryCount === maxRetries) {
        // Después de agotar todos los reintentos, mostrar un mensaje específico
        const isQuotaError = 
          error.message?.includes('Quota exceeded') || 
          error.response?.data?.error?.includes('Quota exceeded');
        
        const errorMessage = isQuotaError 
          ? 'No fue posible generar el reporte. Se ha excedido el límite de solicitudes al servicio. Por favor, inténtelo más tarde.'
          : 'El servidor está experimentando problemas. Por favor, inténtelo más tarde.';
        
        alert(errorMessage);
        return false;
      }

      // Espera exponencial: esperar más tiempo entre cada reintento
      const waitTime = Math.min(Math.pow(2, retryCount) * 1000, 8000); // 2^retryCount segundos, máximo 8 segundos
      console.log(`Esperando ${waitTime/1000} segundos antes del próximo intento...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
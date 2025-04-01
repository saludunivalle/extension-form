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
    // Añadir más casos cuando se implementen las demás configuraciones
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
        // Para el formulario 2, necesitamos obtener tanto los datos principales como los gastos
        if (formNumber === 2) {
          // Obtener datos de SOLICITUDES2
          const dataResponse = await axios.get(`${API_URL}/getSolicitud`, {
            params: { id_solicitud: solicitudId }
          });
          
          // Obtener gastos específicos de esta solicitud
          const gastosResponse = await axios.get(`${API_URL}/getGastos`, {
            params: { id_solicitud: solicitudId }
          });
          
          // Combinar ambos conjuntos de datos
          if (dataResponse.data && gastosResponse.data?.success) {
            formData = {
              ...dataResponse.data,
              gastos: gastosResponse.data.data || []
            };
          }
        } else {
          // Para otros formularios, solo obtener los datos principales
          const dataResponse = await axios.get(`${API_URL}/getSolicitud`, {
            params: { id_solicitud: solicitudId }
          });
          
          if (dataResponse.data) {
            formData = dataResponse.data;
          }
        }
        
        // Aplicar transformaciones específicas para este formulario
        formData = reportConfig.transformData(formData);
      } catch (error) {
        console.error('Error al obtener datos para transformación:', error);
      }
    }

    // Añadir en la función generateFormReport, justo antes de enviar los datos al servidor:
    console.log("📤 Enviando datos al servidor para generar reporte:", {
      solicitudId,
      formNumber,
      configFields: Object.keys(reportConfig).join(', '),
      dataFields: Object.keys(formData).join(', ')
    });

    // También agregar verificación para los campos clave:
    const checkboxFields = reportConfig.fieldMappings?.checkboxFields || [];
    const radioFields = reportConfig.fieldMappings?.radioFields || [];

    if (checkboxFields.length > 0 || radioFields.length > 0) {
      console.log("🔍 Verificando campos importantes:");
      
      checkboxFields.forEach(field => {
        console.log(`  Checkbox ${field}: ${formData[field]}`);
      });
      
      radioFields.forEach(field => {
        console.log(`  Radio ${field}: ${formData[field]}`);
        console.log(`    ${field}_si: ${formData[`${field}_si`]}`);
        console.log(`    ${field}_no: ${formData[`${field}_no`]}`);
      });
    }

    // Solicitar el enlace de Drive al backend incluyendo datos transformados
    const response = await axios.post(`${API_URL}/report/generateReport`, {
      solicitudId,
      formNumber,
      config: reportConfig,
      formData // Incluir datos transformados
    });
    
    // Verificar si la respuesta contiene un enlace directo a Drive
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
 * Abre un reporte en una nueva pestaña y muestra una notificación
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const openFormReport = async (solicitudId, formNumber) => {
  try {
    const reportUrl = await generateFormReport(solicitudId, formNumber);
    
    if (reportUrl) {
      // Abrir directamente la URL en una nueva pestaña
      window.open(reportUrl, '_blank');
      alert(`Informe generado exitosamente para el formulario ${formNumber}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    
    // Método de respaldo directo sin usar el servicio
    try {
      // Intenta abrir directamente una URL del servidor que redirija al Drive
      const backupUrl = `${API_URL}/directDriveLink/${solicitudId}/${formNumber}`;
      window.open(backupUrl, '_blank');
      alert(`Informe generado usando método alternativo para el formulario ${formNumber}`);
      return true;
    } catch (backupError) {
      alert('No fue posible generar el reporte. Por favor, contacte al administrador.');
      return false;
    }
  }
};
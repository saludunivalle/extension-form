import axios from 'axios';

/**
 * Genera un reporte para un formulario específico de una solicitud
 * @param {string|number} solicitudId - ID de la solicitud
 * @param {number} formNumber - Número de formulario (1-4)
 * @returns {Promise<string>} - URL del reporte generado
 */
export const generateFormReport = async (solicitudId, formNumber) => {
  try {
    if (!solicitudId || !formNumber) {
      throw new Error("Información incompleta para generar el reporte");
    }

    console.log(`📄 Generando reporte para Solicitud ID: ${solicitudId}, Formulario: ${formNumber}`);

    const response = await axios.post('https://siac-extension-server.vercel.app/generateReport', {
      solicitudId,
      formNumber,
    });

    if (response.data?.link) {
      console.log(`✅ Reporte generado con éxito: ${response.data.link}`);
      return response.data.link;
    } else {
      throw new Error('No se recibió un enlace de reporte válido.');
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
      window.open(reportUrl, '_blank');
      alert(`Informe generado exitosamente para el formulario ${formNumber}`);
      return true;
    }
    return false;
  } catch (error) {
    alert('Hubo un problema al generar el informe.');
    return false;
  }
};
import axios from 'axios';
import { config } from '../config';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: config.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('google_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Manejar errores específicos
    if (error.code === 'ERR_NETWORK') {
      console.warn('Error de red - posiblemente el servidor no está disponible');
    }
    
    return Promise.reject(error);
  }
);

// Servicios específicos
export const userService = {
  saveUser: async (userData) => {
    try {
      const response = await apiClient.post('/saveUser', userData);
      return response.data;
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  },
  
  getUser: async (userId) => {
    try {
      const response = await apiClient.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }
};

export const formService = {
  saveForm: async (formData) => {
    try {
      const response = await apiClient.post('/form/save', formData);
      return response.data;
    } catch (error) {
      console.error('Error al guardar formulario:', error);
      throw error;
    }
  },
  
  getForm: async (formId) => {
    try {
      const response = await apiClient.get(`/form/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener formulario:', error);
      throw error;
    }
  }
};

export const reportService = {
  generateReport: async (reportData) => {
    try {
      const response = await apiClient.post('/report/generateReport', reportData);
      return response.data;
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw error;
    }
  },
  
  downloadReport: async (reportId) => {
    try {
      const response = await apiClient.get(`/report/downloadReport/${reportId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      throw error;
    }
  }
};

// Función para verificar si el servidor está disponible
export const checkServerHealth = async () => {
  try {
    const response = await apiClient.get('/');
    return response.status === 200;
  } catch (error) {
    console.warn('Servidor no disponible:', error.message);
    return false;
  }
};

export default apiClient;



import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://siac-extension-server.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token de autenticación si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Función para enviar el formulario al servidor
export const submitForm = (formData) => {
  return api.post('/submit', formData)
    .then(response => {
      // Maneja la respuesta exitosa aquí
      return response.data;
    })
    .catch(error => {
      // Maneja cualquier error aquí
      console.error('Error al enviar el formulario:', error);
      throw error;
    });
};

// Otras funciones para interactuar con el backend
export const updateData = (updateData, id, sheetName) => {
  return api.post('/updateData', {
      updateData,
      id,
      sheetName
    })
    .then(response => {
      // Maneja la respuesta exitosa aquí
      return response.data;
    })
    .catch(error => {
      // Maneja cualquier error aquí
      console.error('Error al actualizar los datos:', error);
      throw error;
    });
};

// También podrías tener funciones para obtener datos de Google Sheets
export const getData = (sheetName) => {
  return api.post('/getData', { sheetName })
    .then(response => {
      // Maneja la respuesta exitosa aquí
      return response.data;
    })
    .catch(error => {
      // Maneja cualquier error aquí
      console.error('Error al obtener los datos:', error);
      throw error;
    });
};



import axios from 'axios';

// URL base de tu servidor backend
const API_URL = 'https://siac-extension-server.vercel.app';

// Función para enviar el formulario al servidor
export const submitForm = (formData) => {
  return axios.post(`${API_URL}/submit`, formData)
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
  return axios.post(`${API_URL}/updateData`, {
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
  return axios.post(`${API_URL}/getData`, { sheetName })
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



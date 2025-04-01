import React, { useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import axios from 'axios';

function Step1FormSection2({ formData, handleInputChange }) {
  useEffect(() => {
    // Asegurarse de que los datos básicos estén cargados
    if (!formData.fecha_solicitud) {
      // Establecer la fecha actual si no hay una fecha guardada
      const currentDate = new Date().toISOString().split('T')[0];
      handleInputChange({
        target: {
          name: 'fecha_solicitud',
          value: currentDate
        }
      });
    }
  }, [formData.fecha_solicitud, handleInputChange]);

  useEffect(() => {
    const fetchNombreActividad = async () => {
      try {
        const maxRetries = 3;
        let retryCount = 0;
        let response;

        while (retryCount < maxRetries) {
          try {
            response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
              params: { id_solicitud: formData.id_solicitud }
            });

            if (response.status === 200) {
              // Si la solicitud es exitosa, salir del bucle
              break;
            } else {
              throw new Error(`Request failed with status ${response.status}`);
            }
          } catch (error) {
            console.error(`Intento ${retryCount + 1} fallido:`, error.message);
            retryCount++;
            // Esperar antes de reintentar (estrategia de retroceso exponencial)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }

        if (response && response.data && response.data.nombre_actividad && !formData.nombre_actividad) {
          handleInputChange({
            target: {
              name: 'nombre_actividad',
              value: response.data.nombre_actividad
            }
          });
        }
      } catch (error) {
        console.error('Error al obtener datos de la solicitud:', error);
      }
    };

    if (formData.id_solicitud) {
      fetchNombreActividad();
    }
  }, [formData.id_solicitud, handleInputChange]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Nombre de la Actividad"
          fullWidth
          name="nombre_actividad"
          value={formData.nombre_actividad || ''}
          onChange={handleInputChange}
          required
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          name="fecha_solicitud"
          value={formData.fecha_solicitud || ''}
          onChange={handleInputChange}
          InputLabelProps={{
            shrink: true,
          }}
          required
          disabled
        />
      </Grid>
    </Grid>
  );
}

export default Step1FormSection2;

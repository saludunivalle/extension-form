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
    
    // Intentar cargar el nombre de la actividad desde la solicitud principal
    const fetchNombreActividad = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
          params: { id_solicitud: formData.id_solicitud }
        });
        
        if (response.data && response.data.nombre_actividad && !formData.nombre_actividad) {
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
    
    fetchNombreActividad();
  }, [formData.id_solicitud]); // Asegúrate de incluir la dependencia aquí

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

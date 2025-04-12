import React, { useEffect, useState } from 'react';
import { Grid, TextField, CircularProgress, Typography, Box } from '@mui/material';
import axios from 'axios';

function Step1FormSection2({ formData, handleInputChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
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
      // Skip fetching if we already have the activity name
      if (formData.nombre_actividad) {
        return;
      }
      
      // Check localStorage cache first
      const cacheKey = `solicitud_nombre_${formData.id_solicitud}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.nombre_actividad) {
            console.log("📋 Usando nombre de actividad desde localStorage");
            handleInputChange({
              target: {
                name: 'nombre_actividad',
                value: parsedData.nombre_actividad
              }
            });
            return;
          }
        } catch (e) {
          // If parsing fails, continue with API request
          console.error("Error parsing cached data:", e);
        }
      }
      
      setIsLoading(true);
      setFetchError(null);
      
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
            
            // If we've exhausted retries, save error and use local fallback if available
            if (retryCount >= maxRetries) {
              setFetchError(error.message);
              
              // Try to get name from localStorage as ultimate fallback
              const fallbackName = localStorage.getItem(`solicitud_name_${formData.id_solicitud}`);
              if (fallbackName) {
                handleInputChange({
                  target: {
                    name: 'nombre_actividad',
                    value: fallbackName
                  }
                });
              }
              
              break;
            }
            
            // Esperar antes de reintentar (estrategia de retroceso exponencial)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }

        if (response && response.data && response.data.nombre_actividad) {
          // Save to localStorage cache
          localStorage.setItem(cacheKey, JSON.stringify({
            nombre_actividad: response.data.nombre_actividad,
            timestamp: Date.now()
          }));
          
          // Also save name separately for fallback
          localStorage.setItem(`solicitud_name_${formData.id_solicitud}`, response.data.nombre_actividad);
          
          handleInputChange({
            target: {
              name: 'nombre_actividad',
              value: response.data.nombre_actividad
            }
          });
        }
      } catch (error) {
        console.error('Error al obtener datos de la solicitud:', error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (formData.id_solicitud) {
      fetchNombreActividad();
    }
  }, [formData.id_solicitud, formData.nombre_actividad, handleInputChange]);

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
          //disabled={isLoading}
          helperText={fetchError ? "Error al cargar. Usando datos almacenados localmente." : ""}
          error={!!fetchError}
          InputProps={{
            endAdornment: isLoading ? <CircularProgress size={20} /> : null,
          }}
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

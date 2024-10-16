import React from 'react';
import { Typography, Box, TextField, Grid } from '@mui/material';

function Step3FormSection5({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - LOCACIONES</Typography>

      <Grid container spacing={2}>
        {/* Títulos de las columnas */}
        <Grid item xs={4}>
          <Typography variant="subtitle1">Riesgo</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">¿Aplica?</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Mitigación</Typography>
        </Grid>

        {/* Riesgo 1 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Falta de espacio (salones, salas, auditorios) para la ejecución de la actividad.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaLocacion1"
            value={formData.aplicaLocacion1 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Contar con un listado de auditorios, salones y lugares para desarrollar la actividad.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación por mal estado de las instalaciones locativas.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaLocacion2"
            value={formData.aplicaLocacion2 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Proyección de inversiones locativas o buscar un nuevo lugar para realizar los eventos de Educación Continua.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación por falta de recursos tecnológicos para el desarrollo de las actividades.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaLocacion3"
            value={formData.aplicaLocacion3 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Planificar con antelación el inventario de los mismos y realizar pruebas exhaustivas antes del inicio de actividades.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step3FormSection5;

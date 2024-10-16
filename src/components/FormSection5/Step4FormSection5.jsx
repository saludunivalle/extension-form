import React from 'react';
import { Typography, Box, TextField, Grid } from '@mui/material';

function Step4FormSection5({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DESARROLLO</Typography>

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
            Pérdida de competitividad y de mercado debido a programas de educación continua desactualizados y con contenido no pertinente.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDesarrollo1"
            value={formData.aplicaDesarrollo1 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Asegurar que los contenidos sean revisados y validados, implementar un proceso de actualización periódica del contenido.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de competitividad y de mercado por falta de innovación en las técnicas efectivas de enseñanza para el público objetivo.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDesarrollo2"
            value={formData.aplicaDesarrollo2 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Investigar y probar diferentes metodologías de enseñanza antes de implementarlas.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Falta de compromiso y competencia profesional docente.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDesarrollo3"
            value={formData.aplicaDesarrollo3 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Proporcionar capacitación continua para instructores en técnicas pedagógicas y uso de tecnologías.
          </Typography>
        </Grid>

        {/* Riesgo 4 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la certificación de los programas de educación continua debido a la débil planificación de la etapa evaluación.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDesarrollo4"
            value={formData.aplicaDesarrollo4 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Crear evaluaciones que reflejen adecuadamente los objetivos del curso. Revisar y ajustar las evaluaciones según el feedback.
          </Typography>
        </Grid>

        {/* Riesgo 5 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en el cronograma de ejecución de los programas de educación continua por cambios en los horarios sin previo aviso.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDesarrollo5"
            value={formData.aplicaDesarrollo5 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Reprogramar actividades.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step4FormSection5;

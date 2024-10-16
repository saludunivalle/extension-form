import React from 'react';
import { Typography, Box, TextField, Grid } from '@mui/material';

function Step5FormSection5({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

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
            Falta de estrategias de comunicación y baja asistencia por parte de la audiencia (estudiantes) invitados.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaCierre1"
            value={formData.aplicaCierre1 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Evaluar la cantidad de invitaciones y asegurar que los canales de comunicación sean efectivos.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Debilidades en la verificación del cumplimiento de requisitos para la emisión de certificados.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaCierre2"
            value={formData.aplicaCierre2 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Verificar los requisitos obligatorios para entregar la certificación.
          </Typography>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - OTROS</Typography>

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
            Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaOtros1"
            value={formData.aplicaOtros1 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar seguimiento a encuestas de satisfacción y comentarios de los estudiantes.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Deserción y/o pérdida de mercado en la educación superior por falta de interés o relevancia percibida.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaOtros2"
            value={formData.aplicaOtros2 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Mantener el contenido actualizado con las últimas tendencias y conocimientos en la materia.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step5FormSection5;

import React from 'react';
import { Typography, Box, TextField, Grid } from '@mui/material';

function Step2FormSection5({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DISEÑO</Typography>

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
            Pérdida de competitividad educativa debido a bajas actividades de promoción y mercadeo.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDiseno1"
            value={formData.aplicaDiseno1 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar estudios de mercado para identificar las necesidades y expectativas de los participantes.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Deserción y/o pérdida de mercado en la educación superior por falta de valor agregado en la oferta de programas de extensión.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDiseno2"
            value={formData.aplicaDiseno2 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Mantener programas ajustados a la vanguardia académica y de actualidad.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en el desarrollo de programas de educación continua por inadecuada elaboración de presupuesto.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="¿Aplica?"
            name="aplicaDiseno3"
            value={formData.aplicaDiseno3 || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Cotizar y evaluar precios de mercado reales.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step2FormSection5;

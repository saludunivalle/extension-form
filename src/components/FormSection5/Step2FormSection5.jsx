import React from 'react';
import { Typography, Box, Grid, Checkbox } from '@mui/material';

function Step2FormSection5({ formData, handleInputChange }) {
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DISEÑO</Typography>

      <Grid container spacing={2}>
        {/* Títulos de las columnas */}
        <Grid item xs={4}>
          <Typography variant="subtitle1">RIESGO</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">¿APLICA?</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">MITIGACIÓN</Typography>
        </Grid>

        {/* Riesgo 1 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de competitividad educativa debido a bajas actividades de promoción y mercadeo.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDiseno1"
            checked={formData.aplicaDiseno1 || false}
            onChange={handleCheckboxChange}
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
           Deserción y/o pérdida de mercado en la educación superior por falta de valor agregado en la oferta de programas de extensión en educación continua
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDiseno2"
            checked={formData.aplicaDiseno2 || false}
            onChange={handleCheckboxChange}
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
           Afectación en el desarrollo de programas de educación Continua y perdida de habilidades y competencias en diversos campos de formación académica por la inadecuada elaboración de presupuesto.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDiseno3"
            checked={formData.aplicaDiseno3 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Cotizar y evaluar precios de mercado reales.
          </Typography>
        </Grid>

        {/* Riesgo 4 */}
        <Grid item xs={4}>
          <Typography variant="body1">
          Propuesta no aprobada por el Consejo de Facultad o Consejo de Regionalización debido al incumplimiento en los pasos o requerimientos para el diseño y desarrollo de programas de educación continua.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDiseno4"
            checked={formData.aplicaDiseno4 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
           Seguir el paso a paso del proceso
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step2FormSection5;
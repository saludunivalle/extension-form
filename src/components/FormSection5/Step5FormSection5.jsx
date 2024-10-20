import React from 'react';
import { Typography, Box, Grid, Checkbox } from '@mui/material';

function Step5FormSection5({ formData, handleInputChange }) {
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
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

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
            Afectación de la ejecución de los programas debido a la falta de estrategias de comunicación y baja asistencia por parte de la audiencia (estudiantes) invitados.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaCierre1"
            checked={formData.aplicaCierre1 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Tener en cuenta que la participación se realiza con el 30% del público invitado. Por tanto, evaluar la cantidad de invitaciones realizadas.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Debilidades en el proceso de verificación del cumplimiento de los requisitos de los estudiantes en el programa de educación continua para la emisión de certificados.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaCierre2"
            checked={formData.aplicaCierre2 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Verificar los requisitos obligatorios para entregar la certificación.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa desarrollado.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaCierre3"
            checked={formData.aplicaCierre3 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar seguimiento a encuestas de satisfacción y a comentarios de los estudiantes.
          </Typography>
        </Grid>

      </Grid>

      {/* Riesgos adicionales comentados */}
      {/* <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - OTROS</Typography>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Riesgo</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">¿Aplica?</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Mitigación</Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaOtros1"
            checked={formData.aplicaOtros1 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar seguimiento a encuestas de satisfacción y comentarios de los estudiantes.
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography variant="body1">
            Deserción y/o pérdida de mercado en la educación superior por falta de interés o relevancia percibida.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaOtros2"
            checked={formData.aplicaOtros2 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Mantener el contenido actualizado con las últimas tendencias y conocimientos en la materia.
          </Typography>
        </Grid>
      </Grid> */}
      
    </Box>
  );
}

export default Step5FormSection5;

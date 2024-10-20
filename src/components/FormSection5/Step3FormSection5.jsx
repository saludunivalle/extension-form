import React from 'react';
import { Typography, Box, Grid, Checkbox } from '@mui/material';

function Step3FormSection5({ formData, handleInputChange }) {
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
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - LOCACIONES</Typography>

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
            Afectación en el desarrollo de programas de educación continua debido a la falta de espacio (salones, salas, auditorios) para la ejecución de la actividad.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaLocacion1"
            checked={formData.aplicaLocacion1 || false}
            onChange={handleCheckboxChange}
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
            Afectación en el desarrollo de programas de educación continua debido mal estado de las instalaciones locativas.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaLocacion2"
            checked={formData.aplicaLocacion2 || false}
            onChange={handleCheckboxChange}
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
            Afectación en el desarrollo de programas de educación continua debido a la falta de recursos tecnológicos para el desarrollo de las actividades (equipos de computo, aire acondicionado).
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaLocacion3"
            checked={formData.aplicaLocacion3 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Planificar con antelación el inventario de los mismos. <br />
            Realizar pruebas exhaustivas antes del inicio actividades. <br />
            Asegurar que haya soporte técnico disponible para resolver problemas rápidamente.
          </Typography>
        </Grid>

        {/* Riesgo 4 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la ejecución de programas de educación continua por cierre, bloqueos o factores externos (Inundaciones, temblores, etc.) en el campus Universitario.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaLocacion4"
            checked={formData.aplicaLocacion4 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Tener lugares alternativos para realizar el evento, debe incluirse en el rubro de imprevistos. <br />
            Mantener un plan de trabajo virtual, remoto o asistido por tecnologías cuando no se pueda dictar el programa de manera presencial.
          </Typography>
        </Grid>

        {/* Riesgo 5 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la ejecución de programas de educación continua debido a problemas tecnológicos como fallas de conectividad.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaLocacion5"
            checked={formData.aplicaLocacion5 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Validar la conexión del lugar donde se impartirá el curso con suficiente tiempo el día del evento o días anteriores.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step3FormSection5;

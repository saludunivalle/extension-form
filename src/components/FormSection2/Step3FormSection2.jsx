import React from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';

function Step3FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
      <Tooltip title="El alcance delimita claramente la actividad de extensión, indica los límites de aplicabilidad o cobertura de la actividad, es decir, a que áreas, sectores involucra o población objetivo.">
        <TextField
          label="Alcance"
          fullWidth
          multiline
          rows={4}
          name="alcance"
          value={formData.alcance || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
      <Tooltip title="Hace referencia al conjunto de procedimientos racionales utilizados para alcanzar los objetivos los propuestos">
        <TextField
          label="Metodología"
          fullWidth
          multiline
          rows={4}
          name="metodologia"
          value={formData.metodologia || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
      <Tooltip title="Personas o entidades sobre las cuales se está intentando fortalecer los conocimientos en los temas  que estará dirigida la actividad.">
        <TextField
          label="Dirigido a"
          fullWidth
          multiline
          rows={2}
          name="dirigido_a"
          value={formData.dirigido_a || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default Step3FormSection2;

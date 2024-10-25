import React from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';

function Step4FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
      <Tooltip title={<span style={{ fontSize: '15px' }}>Forma en que se ha programado la actividad, forma en que se ha dividido ya sea en capítulos o módulos, y temas a tratar en cada uno de estos módulos.</span>}>
        <TextField
          label="Programa y Contenidos"
          fullWidth
          multiline
          rows={4}
          name="programa_contenidos"
          value={formData.programa_contenidos || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
      <Tooltip title={<span style={{ fontSize: '15px' }}>Tiempo total que tomara realizar la actividad, también pueden darse los horarios que se manejaran.</span>}>
        <TextField
          label="Duración"
          fullWidth
          name="duracion"
          value={formData.duracion || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default Step4FormSection2;
 
import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

function Step5FormSection3({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Visto Bueno</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Coordinador de la Actividad de Extensión"
          fullWidth
          name="coordinador_actividad"
          value={formData.coordinador_actividad || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Visto Bueno de la Unidad Académica"
          fullWidth
          name="visto_bueno_unidad"
          value={formData.visto_bueno_unidad || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step5FormSection3;

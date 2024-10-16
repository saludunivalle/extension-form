import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step4FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
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
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Duración"
          fullWidth
          name="duracion"
          value={formData.duracion || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step4FormSection2;
 
import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step2FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Justificación"
          fullWidth
          multiline
          rows={4}
          name="justificacion"
          value={formData.justificacion || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={4}
          name="descripcion"
          value={formData.descripcion || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step2FormSection2;

import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step5FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Certificación"
          fullWidth
          name="certificacion"
          value={formData.certificacion || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Recursos (Personal, Físicos, Tecnológicos y de Apoyo)"
          fullWidth
          multiline
          rows={4}
          name="recursos"
          value={formData.recursos || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step5FormSection2;

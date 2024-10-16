import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step1FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Introducción"
          fullWidth
          multiline
          rows={4}
          name="introduccion"
          value={formData.introduccion || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Objetivo General"
          fullWidth
          multiline
          rows={4}
          name="objetivo_general"
          value={formData.objetivo_general || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Objetivos Específicos"
          fullWidth
          multiline
          rows={4}
          name="objetivos_especificos"
          value={formData.objetivos_especificos || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step1FormSection2;

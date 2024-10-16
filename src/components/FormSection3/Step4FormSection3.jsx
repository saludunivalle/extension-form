import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

function Step4FormSection3({ formData, handleInputChange, totalRecursos }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Resumen Financiero</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Total Recursos"
          fullWidth
          name="total_recursos"
          value={formData.total_recursos || totalRecursos}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step4FormSection3;

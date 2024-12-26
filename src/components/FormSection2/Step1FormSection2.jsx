import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step1FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Nombre de la Actividad"
          fullWidth
          name="nombre_actividad"
          value={formData.nombre_actividad || ''}
          onChange={handleInputChange}
          required
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          name="fecha_solicitud"
          value={formData.fecha_solicitud || ''}
          onChange={handleInputChange}
          InputLabelProps={{
            shrink: true,
          }}
          required
          disabled
        />
      </Grid>
    </Grid>
  );
}

export default Step1FormSection2;

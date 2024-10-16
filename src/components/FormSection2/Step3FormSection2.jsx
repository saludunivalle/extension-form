import React from 'react';
import { Grid, TextField } from '@mui/material';

function Step3FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
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
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
      <Grid item xs={12}>
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
      </Grid>
    </Grid>
  );
}

export default Step3FormSection2;

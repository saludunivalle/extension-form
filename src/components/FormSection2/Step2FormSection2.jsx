import React from 'react';
import { Grid, TextField, Tooltip} from '@mui/material';

function Step2FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
      <Tooltip title={<span style={{ fontSize: '15px' }}>Exponer las razones por las cuales se quiere realizar la actividad de extensión. Toda actividad debe realizarse con un propósito definido. Debe explicar el por qué es conveniente, el para qué de la actividad y cuáles son los beneficios que se esperan.</span>}>
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
      </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Es una visión, lo más explícita y amplia posible, de la intención educativa de la actividad y de los objetivos de aprendizaje que pretende alcanzar. Para lograrlo, se recomienda que el párrafo inicial sea claro, específico y de una visión general de lo que se va a encontrar.</span>}>
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
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default Step2FormSection2;

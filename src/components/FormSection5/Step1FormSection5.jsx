import React from 'react';
import { Typography, Box, TextField } from '@mui/material';

function Step1FormSection5({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>PROPÓSITO</Typography>
      <TextField label="Definir los posibles riesgos asociados en el diseño y desarrollo de programas de educación continua." name="proposito" value={formData.proposito || ''} onChange={handleInputChange} fullWidth margin="normal" />

      <Typography variant="h6" gutterBottom>COMENTARIO</Typography>
      <TextField label="El seguimiento y/o control del diseño y desarrollo de programas de educación continua está orientado a la verificación del cumplimiento de los requisitos normativos." name="comentario" value={formData.comentario || ''} onChange={handleInputChange} fullWidth margin="normal" />

      <Typography variant="h6" gutterBottom>PROGRAMA</Typography>
      <TextField label="Programa" name="programa" value={formData.programa || ''} onChange={handleInputChange} fullWidth margin="normal" />
      
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
          sx={{ marginTop: 2, marginBottom: 2 }}
          disabled
      />

      <Typography variant="h6" gutterBottom>ELABORADO POR</Typography>
      <TextField disabled label="Elaborado por" name="nombre_solicitante" value={formData.nombre_solicitante || ''} onChange={handleInputChange} fullWidth margin="normal" />
    </Box>
  );
}

export default Step1FormSection5;

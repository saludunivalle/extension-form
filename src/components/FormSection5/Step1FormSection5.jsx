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
      
      <Typography variant="h6" gutterBottom>FECHA</Typography>
      <TextField label="Fecha" name="fecha" value={formData.fecha || ''} onChange={handleInputChange} fullWidth margin="normal" />

      <Typography variant="h6" gutterBottom>ELABORADO POR</Typography>
      <TextField label="Elaborado por" name="elaboradoPor" value={formData.elaboradoPor || ''} onChange={handleInputChange} fullWidth margin="normal" />
    </Box>
  );
}

export default Step1FormSection5;

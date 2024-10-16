import { TextField, Box, Typography } from '@mui/material';

function Step1FormSection4({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Breve descripción del programa
      </Typography>
      <TextField
        label="Descripción del programa"
        name="descripcionPrograma"
        value={formData.descripcionPrograma || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      <Typography variant="h6" gutterBottom>
        Actualmente ¿Cómo identifican las necesidades de requerimiento para abrir este programa de Educación Continua?
      </Typography>
      <TextField
        label="Identificación de necesidades"
        name="identificacionNecesidades"
        value={formData.identificacionNecesidades || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
    </Box>
  );
}

export default Step1FormSection4;

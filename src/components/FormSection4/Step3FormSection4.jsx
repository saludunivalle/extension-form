import { TextField, Grid, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';

function Step3FormSection4({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>¿Cuáles son los indicadores previos para medir la acogida de este programa de Educación Continua?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><TextField label="Cantidad de personas que mostraron interés" name="personasInteres" value={formData.personasInteres || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
        <Grid item xs={4}><TextField label="Cantidad de personas matriculadas previamente" name="personasMatriculadas" value={formData.personasMatriculadas || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
        <Grid item xs={4}><TextField label="Otro ¿Cuál?" name="otroInteres" value={formData.otroInteres || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>¿Cuáles son las variables de mercadeo utilizadas por su área para abrir un nuevo programa de Educación Continua?</Typography>
      <FormControlLabel control={<Checkbox checked={formData.innovacion || false} onChange={handleInputChange} name="innovacion" />} label="Innovación" />
      <FormControlLabel control={<Checkbox checked={formData.solicitudExterno || false} onChange={handleInputChange} name="solicitudExterno" />} label="Solicitud cliente externo" />
      <FormControlLabel control={<Checkbox checked={formData.interesSondeo || false} onChange={handleInputChange} name="interesSondeo" />} label="El público ha manifestado interés mediante sondeo previo" />

      <Typography variant="h6" gutterBottom>¿Cuál de las siguientes estrategias han utilizado para sondear previamente el interés de las personas frente a la apertura de un programa de Educación Continua?</Typography>
      <FormControlLabel control={<Checkbox checked={formData.llamadas || false} onChange={handleInputChange} name="llamadas" />} label="Llamadas" />
      <FormControlLabel control={<Checkbox checked={formData.encuestas || false} onChange={handleInputChange} name="encuestas" />} label="Encuestas" />
      <FormControlLabel control={<Checkbox checked={formData.webinar || false} onChange={handleInputChange} name="webinar" />} label="Webinar" />

      <Typography variant="h6" gutterBottom>¿Cuentan con un preregistro, bases de datos, formularios diligenciados, etc., para aperturar el programa?</Typography>
      <TextField label="Preregistro" name="preregistro" value={formData.preregistro || ''} onChange={handleInputChange} fullWidth margin="normal" />
    </Box>
  );
}

export default Step3FormSection4;

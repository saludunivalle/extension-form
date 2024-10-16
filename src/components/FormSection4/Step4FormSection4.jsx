import { TextField, Box, Typography, FormControlLabel, Checkbox, RadioGroup, Radio, Grid } from '@mui/material';

function Step4FormSection4({ formData, handleInputChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>¿Participa en mesas de trabajo sectoriales?</Typography>
      <TextField label="Mesas de trabajo sectoriales" name="mesasTrabajo" value={formData.mesasTrabajo || ''} onChange={handleInputChange} fullWidth margin="normal" />

      <Typography variant="h6" gutterBottom>¿Qué actividades de mercadeo relacional se realizan como indicador para analizar la demanda del programa?</Typography>
      <FormControlLabel control={<Checkbox checked={formData.focusGroup || false} onChange={handleInputChange} name="focusGroup" />} label="Focus Group" />
      <FormControlLabel control={<Checkbox checked={formData.desayunosTrabajo || false} onChange={handleInputChange} name="desayunosTrabajo" />} label="Desayunos de trabajo" />
      <FormControlLabel control={<Checkbox checked={formData.almuerzosTrabajo || false} onChange={handleInputChange} name="almuerzosTrabajo" />} label="Almuerzos de trabajo" />
      <FormControlLabel control={<Checkbox checked={formData.openHouse || false} onChange={handleInputChange} name="openHouse" />} label="Open House" />

      <Typography variant="h6" gutterBottom>¿El valor económico de los programas de Educación Continua es atractivo y competitivo frente al mercado?</Typography>
      <RadioGroup name="valorEconomico" value={formData.valorEconomico || ''} onChange={handleInputChange}>
        <FormControlLabel value="si" control={<Radio />} label="Sí" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>

      <Typography variant="h6" gutterBottom>¿Este programa de educación continua, bajo qué modalidad se va a ofrecer?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadPresencial || false} onChange={handleInputChange} name="modalidadPresencial" />} label="Presencial" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadVirtual || false} onChange={handleInputChange} name="modalidadVirtual" />} label="Virtual" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadSemipresencial || false} onChange={handleInputChange} name="modalidadSemipresencial" />} label="Semipresencial" /></Grid>
      </Grid>
      <TextField label="Otra modalidad ¿Cuál?" name="otraModalidad" value={formData.otraModalidad || ''} onChange={handleInputChange} fullWidth margin="normal" />
    </Box>
  );
}

export default Step4FormSection4;

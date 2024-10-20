import { TextField, Box, Typography, FormControlLabel, Checkbox, RadioGroup, Radio, Grid } from '@mui/material';

function Step4FormSection4({ formData, handleInputChange }) {

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };


  return (
    <Box>
      <Typography variant="h6" gutterBottom>¿Participa en mesas de trabajo sectoriales?</Typography>
      <FormControlLabel control={<Checkbox checked={formData.gremios || false} onChange={handleCheckboxChange} name="gremios" />} label="Gremios" />
      <FormControlLabel control={<Checkbox checked={formData.sectores_empresariales || false} onChange={handleCheckboxChange} name="sectores_empresariales" />} label="Sectores Emrpesariales" />
      <FormControlLabel control={<Checkbox checked={formData.politicas_publicas || false} onChange={handleCheckboxChange} name="politicas_publicas" />} label="Polìticas Públicas" />
      <FormControlLabel control={<Checkbox checked={formData.otros_mesas_trabajo || false} onChange={handleCheckboxChange} name="otros_mesas_trabajo" />} label="Otro" />
      {formData.otros_mesas_trabajo && (
        <TextField
          label="¿Cuál?"
          name="otros_mesas_trabajo"
          value={formData.otros_mesas_trabajo || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      )}

      <Typography variant="h6" gutterBottom>¿Qué actividades de mercadeo relacional se realizan como indicador para analizar la demanda del programa?</Typography>
      <FormControlLabel control={<Checkbox checked={formData.focusGroup || false} onChange={handleCheckboxChange} name="focusGroup" />} label="Focus Group" />
      <FormControlLabel control={<Checkbox checked={formData.desayunosTrabajo || false} onChange={handleCheckboxChange} name="desayunosTrabajo" />} label="Desayunos de trabajo" />
      <FormControlLabel control={<Checkbox checked={formData.almuerzosTrabajo || false} onChange={handleCheckboxChange} name="almuerzosTrabajo" />} label="Almuerzos de trabajo" />
      <FormControlLabel control={<Checkbox checked={formData.openHouse || false} onChange={handleCheckboxChange} name="openHouse" />} label="Open House" />
      <FormControlLabel control={<Checkbox checked={formData.ferias_colegios || false} onChange={handleCheckboxChange} name="ferias_colegios" />} label="Ferias en Colegios" />
      <FormControlLabel control={<Checkbox checked={formData.ferias_empresarial || false} onChange={handleCheckboxChange} name="ferias_empresarial" />} label="Ferias empresariales locales, nacionales e internacionales" />
      <FormControlLabel control={<Checkbox checked={formData.otros_mercadeo || false} onChange={handleCheckboxChange} name="otros_mercadeo" />} label="Otro" />
      {formData.otros_mercadeo && (
        <TextField
          label="¿Cuál?"
          name="otros_mercadeo"
          value={formData.otros_mercadeo || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
      )}

      <Typography variant="h6" gutterBottom>¿El valor económico de los programas de Educación Continua es atractivo y competitivo frente al mercado?</Typography>
      <RadioGroup name="valorEconomico" value={formData.valorEconomico || ''} onChange={handleInputChange}>
        <FormControlLabel value="si" control={<Radio />} label="Sí" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>

      <Typography variant="h6" gutterBottom>¿Este programa de educación continua, bajo qué modalidad se va a ofrecer?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadPresencial || false} onChange={handleCheckboxChange} name="modalidadPresencial" />} label="Presencial" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadVirtual || false} onChange={handleCheckboxChange} name="modalidadVirtual" />} label="Virtual" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidadSemipresencial || false} onChange={handleCheckboxChange} name="modalidadSemipresencial" />} label="Semipresencial" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.traslados_docente || false} onChange={handleCheckboxChange} name="traslados_docente" />} label="Traslados del docente a un punto de capacitación determinado" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.modalidad_asistida_tecnologia || false} onChange={handleCheckboxChange} name="modalidad_asistida_tecnologia" />} label="Presencialidad asistida por tecnologías" /></Grid>
      </Grid>
    </Box>
  );
}

export default Step4FormSection4;

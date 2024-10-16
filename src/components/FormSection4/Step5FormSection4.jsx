import { TextField, Box, Typography, FormControlLabel, Checkbox, Grid } from '@mui/material';

function Step5FormSection4({ formData, handleInputChange }) {
  return (
    <Box>
      {/* Beneficios del programa */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los beneficios que se ofrecen para los estudiantes de este programa de Educación Continua?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}><FormControlLabel control={<Checkbox checked={formData.beneficiosTangibles || false} onChange={handleInputChange} name="beneficiosTangibles" />} label="Tangibles" /></Grid>
        <Grid item xs={6}><FormControlLabel control={<Checkbox checked={formData.beneficiosIntangibles || false} onChange={handleInputChange} name="beneficiosIntangibles" />} label="Intangibles" /></Grid>
      </Grid>

      {/* Públicos potenciales */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los públicos potenciales frente al programa de Educación Continua ofertado?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.particulares || false} onChange={handleInputChange} name="particulares" />} label="Particulares" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.colegios || false} onChange={handleInputChange} name="colegios" />} label="Colegios" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.empresas || false} onChange={handleInputChange} name="empresas" />} label="Empresas" /></Grid>
      </Grid>
      <TextField label="Otro público potencial" name="otroPublico" value={formData.otroPublico || ''} onChange={handleInputChange} fullWidth margin="normal" />

      {/* Tendencias actuales */}
      <Typography variant="h6" gutterBottom>¿Cuáles son las tendencias actuales frente al programa ofrecido por la unidad académica?</Typography>
      <TextField label="Tendencias actuales" name="tendenciasActuales" value={formData.tendenciasActuales || ''} onChange={handleInputChange} fullWidth margin="normal" />

      {/* DOFA del programa */}
      <Typography variant="h6" gutterBottom>Describa el DOFA referente al programa</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField label="Debilidades" name="dofaDebilidades" value={formData.dofaDebilidades || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
        <Grid item xs={6}><TextField label="Oportunidades" name="dofaOportunidades" value={formData.dofaOportunidades || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField label="Fortalezas" name="dofaFortalezas" value={formData.dofaFortalezas || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
        <Grid item xs={6}><TextField label="Amenazas" name="dofaAmenazas" value={formData.dofaAmenazas || ''} onChange={handleInputChange} fullWidth margin="normal" /></Grid>
      </Grid>

      {/* Canales de divulgación */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los canales de divulgación para la apertura del nuevo programa de Educación Continua?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.paginaWeb || false} onChange={handleInputChange} name="paginaWeb" />} label="Página web" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.facebook || false} onChange={handleInputChange} name="facebook" />} label="Facebook" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.instagram || false} onChange={handleInputChange} name="instagram" />} label="Instagram" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.linkedin || false} onChange={handleInputChange} name="linkedin" />} label="LinkedIn" /></Grid>
      </Grid>
      <TextField label="Otro canal de divulgación" name="otroCanalDivulgacion" value={formData.otroCanalDivulgacion || ''} onChange={handleInputChange} fullWidth margin="normal" />
    </Box>
  );
}

export default Step5FormSection4;

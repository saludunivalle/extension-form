import { TextField, Box, Typography, FormControlLabel, Checkbox, Grid } from '@mui/material';

function Step5FormSection4({ formData, handleInputChange }) {
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
      {/* Beneficios del programa */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los beneficios que se ofrecen para los estudiantes de este programa de Educación Continua?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Beneficios Tangibles"
            name="beneficiosTangibles"
            value={formData.beneficiosTangibles || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Beneficions Intangibles"
            name="beneficiosIntangibles"
            value={formData.beneficiosIntangibles || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </Grid>
      </Grid>

      {/* Públicos potenciales */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los públicos potenciales frente al programa de Educación Continua ofertado?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.particulares || false} onChange={handleCheckboxChange} name="particulares" />} label="Particulares" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.colegios || false} onChange={handleCheckboxChange} name="colegios" />} label="Colegios" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.empresas || false} onChange={handleCheckboxChange} name="empresas" />} label="Empresas" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.egresados || false} onChange={handleCheckboxChange} name="egresados" />} label="Egresados" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.colaboradores || false} onChange={handleCheckboxChange} name="colaboradores" />} label="Colaboradores" /></Grid>
        <Grid item xs={4}><FormControlLabel control={<Checkbox checked={formData.otros_publicos_potenciales || false} onChange={handleCheckboxChange} name="otros_publicos_potenciales" />} label="Otros" />
        {formData.otros_publicos_potenciales && (
            <TextField
              label="¿Cuál?"
              name="otros_publicos_potenciales"
              value={formData.otros_publicos_potenciales}
              onChange={handleInputChange}
              fullWidth
            />
          )}
        </Grid>
      </Grid>

      {/* Tendencias actuales */}
      <Typography variant="h6" gutterBottom>¿Cuáles son las tendencias actuales frente al programa ofrecido por la unidad académica?</Typography>
      <TextField label="Tendencias actuales" name="tendenciasActuales" value={formData.tendenciasActuales || ''} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4}/>

      {/* DOFA del programa */}
      <Typography variant="h6" gutterBottom>Describa el DOFA referente al programa</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField label="Debilidades" name="dofaDebilidades" value={formData.dofaDebilidades || ''} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} /></Grid>
        <Grid item xs={6}><TextField label="Oportunidades" name="dofaOportunidades" value={formData.dofaOportunidades || ''} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} /></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}><TextField label="Fortalezas" name="dofaFortalezas" value={formData.dofaFortalezas || ''} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} /></Grid>
        <Grid item xs={6}><TextField label="Amenazas" name="dofaAmenazas" value={formData.dofaAmenazas || ''} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} /></Grid>
      </Grid>

      {/* Canales de divulgación */}
      <Typography variant="h6" gutterBottom>¿Cuáles son los canales de divulgación para la apertura del nuevo programa de Educación Continua?</Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.paginaWeb || false} onChange={handleCheckboxChange} name="paginaWeb" />} label="Página web" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.facebook || false} onChange={handleCheckboxChange} name="facebook" />} label="Facebook" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.instagram || false} onChange={handleCheckboxChange} name="instagram" />} label="Instagram" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.linkedin || false} onChange={handleCheckboxChange} name="linkedin" />} label="LinkedIn" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.correo || false} onChange={handleCheckboxChange} name="correo" />} label="LinkedIn" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.prensa || false} onChange={handleCheckboxChange} name="prensa" />} label="Prensa" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.boletin || false} onChange={handleCheckboxChange} name="boletin" />} label="Boletín" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.llamadas_redes || false} onChange={handleCheckboxChange} name="llamadas_redes" />} label="Llamadas (Bases de datos)" /></Grid>
        <Grid item xs={3}><FormControlLabel control={<Checkbox checked={formData.otro_canal || false} onChange={handleCheckboxChange} name="otro_canal" />} label="Otro" />
        {formData.otros_canal && (
            <TextField
              label="¿Cuál?"
              name="otros_canal"
              value={formData.otros_canal}
              onChange={handleInputChange}
              fullWidth
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Step5FormSection4;

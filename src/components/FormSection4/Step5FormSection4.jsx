import { TextField, Box, Typography, FormControlLabel, Checkbox, Grid } from '@mui/material';
import PropTypes from "prop-types";

function Step5FormSection4({ formData, handleInputChange, errors = {} }) {
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
      <Typography variant="h6" gutterBottom>
        ¿Cuáles son los beneficios que se ofrecen para los estudiantes de este programa de Educación Continua?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Tangibles"
            name="beneficiosTangibles"
            value={formData.beneficiosTangibles || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.beneficiosTangibles}
            helperText={errors.beneficiosTangibles}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Intangibles"
            name="beneficiosIntangibles"
            value={formData.beneficiosIntangibles || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.beneficiosIntangibles}
            helperText={errors.beneficiosIntangibles}
          />
        </Grid>
      </Grid>

      {/* Modalidad del programa - NUEVO */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        ¿Cuáles son los públicos potenciales frente al programa de Educación Continua ofertado?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.particulares === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="particulares" 
              />
            } 
            label="Particulares" 
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.colegios === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="colegios" 
              />
            } 
            label="Colegios" 
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.empresas === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="empresas" 
              />
            } 
            label="Empresas" 
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.egresados === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="egresados" 
              />
            } 
            label="Egresados" 
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.colaboradores === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="colaboradores" 
              />
            } 
            label="Colaboradores" 
          />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.otros_publicos_potencialesChecked === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="otros_publicos_potencialesChecked" 
              />
            } 
            label="Otros ¿Cuál?" 
          />
          {formData.otros_publicos_potencialesChecked === 'Sí' && (
            <TextField
              label="¿Cuál?"
              name="otros_publicos_potenciales"
              value={formData.otros_publicos_potenciales || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.otros_publicos_potenciales}
              helperText={errors.otros_publicos_potenciales}
            />
          )}
        </Grid>
      </Grid>

      {/* Tendencias actuales */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        ¿Cuáles son las tendencias actuales frente al programa ofrecido por la unidad académica? 
      </Typography>
      <TextField 
        label="Tendencias actuales" 
        name="tendenciasActuales" 
        value={formData.tendenciasActuales || ''} 
        onChange={handleInputChange} 
        fullWidth 
        margin="normal" 
        multiline 
        rows={4}
        error={!!errors.tendenciasActuales}
        helperText={errors.tendenciasActuales}
      />

      {/* DOFA - NUEVO */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Describa el DOFA referente al programa
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Debilidades"
            name="dofaDebilidades"
            value={formData.dofaDebilidades || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!errors.dofaDebilidades}
            helperText={errors.dofaDebilidades}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Oportunidades"
            name="dofaOportunidades"
            value={formData.dofaOportunidades || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!errors.dofaOportunidades}
            helperText={errors.dofaOportunidades}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Fortalezas"
            name="dofaFortalezas"
            value={formData.dofaFortalezas || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!errors.dofaFortalezas}
            helperText={errors.dofaFortalezas}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Amenazas"
            name="dofaAmenazas"
            value={formData.dofaAmenazas || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            error={!!errors.dofaAmenazas}
            helperText={errors.dofaAmenazas}
          />
        </Grid>
      </Grid>

      {/* Canales de divulgación - NUEVO */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        ¿Cuáles son los canales de divulgación para la apertura del nuevo programa de Educación Continua?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.paginaWeb === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="paginaWeb" 
              />
            } 
            label="Página Web" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.facebook === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="facebook" 
              />
            } 
            label="Facebook" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.instagram === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="instagram" 
              />
            } 
            label="Instagram" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.linkedin === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="linkedin" 
              />
            } 
            label="LinkedIn" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.correo === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="correo" 
              />
            } 
            label="Correo" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.prensa === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="prensa" 
              />
            } 
            label="Prensa" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.boletin === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="boletin" 
              />
            } 
            label="Boletín" 
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.llamadas_redes === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="llamadas_redes" 
              />
            } 
            label="Llamadas" 
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.otro_canalChecked === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="otro_canalChecked" 
              />
            } 
            label="Otros ¿Cuál?" 
          />
          {formData.otro_canalChecked === 'Sí' && (
            <TextField
              label="¿Cuál?"
              name="otro_canal"
              value={formData.otro_canal || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.otro_canal}
              helperText={errors.otro_canal}
            />
          )}
        </Grid>
      </Grid>
      {errors.canalesDivulgacion && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.canalesDivulgacion}
        </Typography>
      )}
    </Box>
  );
}

Step5FormSection4.propTypes = {
  formData: PropTypes.shape({
    beneficiosTangibles: PropTypes.string,
    beneficiosIntangibles: PropTypes.string,
    // Modalidad del programa
    particulares: PropTypes.oneOfType([PropTypes.string]),
    colegios: PropTypes.oneOfType([PropTypes.string]),
    empresas: PropTypes.oneOfType([PropTypes.string]),
    egresados: PropTypes.oneOfType([PropTypes.string]),
    colaboradores: PropTypes.oneOfType([PropTypes.string]),
    otros_publicos_potenciales: PropTypes.string,
    otros_publicos_potencialesChecked: PropTypes.string,
    // Tendencias
    tendenciasActuales: PropTypes.string,
    // DOFA
    dofaDebilidades: PropTypes.string,
    dofaOportunidades: PropTypes.string,
    dofaFortalezas: PropTypes.string,
    dofaAmenazas: PropTypes.string,
    // Canales de divulgación
    paginaWeb: PropTypes.oneOfType([PropTypes.string]),
    facebook: PropTypes.oneOfType([PropTypes.string]),
    instagram: PropTypes.oneOfType([PropTypes.string]),
    linkedin: PropTypes.oneOfType([PropTypes.string]),
    correo: PropTypes.oneOfType([PropTypes.string]),
    prensa: PropTypes.oneOfType([PropTypes.string]),
    boletin: PropTypes.oneOfType([PropTypes.string]),
    llamadas_redes: PropTypes.oneOfType([PropTypes.string]),
    otro_canal: PropTypes.string,
    otro_canalChecked: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

export default Step5FormSection4;

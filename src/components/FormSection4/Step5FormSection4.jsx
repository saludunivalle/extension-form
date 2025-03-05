import { TextField, Box, Typography, FormControlLabel, Checkbox, Grid } from '@mui/material';
import PropTypes from "prop-types";

function Step5FormSection4({ formData, handleInputChange, errors }) {
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
            label="Beneficios Tangibles"
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
            label="Beneficios Intangibles"
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

      {/* Públicos potenciales */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Públicos potenciales
      </Typography>
      <Grid container spacing={2}>
        {/* Aquí se mantienen los demás checkboxes existentes */}
        <Grid item xs={4}>
          <FormControlLabel 
            control={
              <Checkbox 
                // Cambiado para usar el nuevo campo de validación
                checked={formData.otros_publicos_potencialesChecked === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="otros_publicos_potencialesChecked" 
              />
            } 
            label="Otros" 
          />
          {formData.otros_publicos_potencialesChecked === 'Sí' && (
            <TextField
              label="¿Cuál?"
              name="otros_publicos_potenciales"
              value={formData.otros_publicos_potenciales || ''}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.otros_publicos_potenciales}
              helperText={errors.otros_publicos_potenciales}
            />
          )}
        </Grid>
      </Grid>
      {errors.publicosPotenciales && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.publicosPotenciales}
        </Typography>
      )}

      {/* Tendencias actuales */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Tendencias actuales
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

      {/* DOFA */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        DOFA
      </Typography>
      <Grid container spacing={2}>
        {/* Aquí puedes agregar los campos DOFA con validación similar */}
      </Grid>

      {/* Canales de divulgación */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Canales de divulgación
      </Typography>
      <Grid container spacing={2}>
        {/* Mantener aquí los demás checkboxes existentes */}
        <Grid item xs={3}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={formData.otro_canalChecked === 'Sí'} 
                onChange={handleCheckboxChange} 
                name="otro_canalChecked" 
              />
            } 
            label="Otro" 
          />
          {formData.otro_canalChecked === 'Sí' && (
            <TextField
              label="¿Cuál?"
              name="otro_canal"
              value={formData.otro_canal || ''}
              onChange={handleInputChange}
              fullWidth
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
    particulares: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    colegios: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    empresas: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    egresados: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    colaboradores: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    otros_publicos_potenciales: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    tendenciasActuales: PropTypes.string,
    dofaDebilidades: PropTypes.string,
    dofaOportunidades: PropTypes.string,
    dofaFortalezas: PropTypes.string,
    dofaAmenazas: PropTypes.string,
    paginaWeb: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    facebook: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    instagram: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    linkedin: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    correo: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    prensa: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    boletin: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    llamadas_redes: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    otro_canal: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    // Campo adicional para el checkbox de "Otros" públicos potenciales
    otros_publicos_potencialesChecked: PropTypes.string,
    // Campo adicional para el checkbox de "Otro" canal
    otro_canalChecked: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

Step5FormSection4.defaultProps = {
  errors: {},
};

export default Step5FormSection4;

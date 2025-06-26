import { Grid, TextField } from '@mui/material';
import PropTypes from "prop-types";

function Step2({ formData, handleInputChange, errors }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Introducción"
          fullWidth
          multiline
          rows={4}
          name="introduccion"
          value={formData.introduccion || ''}
          onChange={handleInputChange}
          required
          error={!!errors.introduccion}
          helperText={errors.introduccion}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Objetivo General"
          fullWidth
          multiline
          rows={4}
          name="objetivo_general"
          value={formData.objetivo_general || ''}
          onChange={handleInputChange}
          required
          error={!!errors.objetivo_general}
          helperText={errors.objetivo_general}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Objetivos Específicos"
          fullWidth
          multiline
          rows={4}
          name="objetivos_especificos"
          value={formData.objetivos_especificos || ''}
          onChange={handleInputChange}
          required
          error={!!errors.objetivos_especificos}
          helperText={errors.objetivos_especificos}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Justificación"
          fullWidth
          multiline
          rows={4}
          name="justificacion"
          value={formData.justificacion || ''}
          onChange={handleInputChange}
          required
          error={!!errors.justificacion}
          helperText={errors.justificacion}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Metodología"
          fullWidth
          multiline
          rows={4}
          name="metodologia"
          value={formData.metodologia || ''}
          onChange={handleInputChange}
          required
          error={!!errors.metodologia}
          helperText={errors.metodologia}
        />
      </Grid>
    </Grid>
  );
}

Step2.propTypes = {
  formData: PropTypes.shape({
    introduccion: PropTypes.string,
    objetivo_general: PropTypes.string,
    objetivos_especificos: PropTypes.string,
    justificacion: PropTypes.string,
    metodologia: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    introduccion: PropTypes.string,
    objetivo_general: PropTypes.string,
    objetivos_especificos: PropTypes.string,
    justificacion: PropTypes.string,
    metodologia: PropTypes.string,
  }).isRequired,
};

export default Step2;

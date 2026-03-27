import { Grid, TextField, FormControl, FormControlLabel, FormLabel, RadioGroup, Radio, FormHelperText } from '@mui/material';
import { fr } from 'date-fns/locale';
import PropTypes from "prop-types";

function Step2({ formData, handleInputChange, errors, entradas_diseño }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors?.entradas_diseño} required>
          <FormLabel component="legend"> Entradas para el Diseño</FormLabel>
          <RadioGroup
            name="entradas_diseño"
            value={formData.entradas_diseño || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="F-07-MP-05-01-01 Conocimiento de las necesidades del mercado" control={<Radio />} label="F-07-MP-05-01-01 Conocimiento de las necesidades del mercado" />
            <FormControlLabel value="Tendencias Sectoriales del Mercado" control={<Radio />} label="Tendencias Sectoriales del Mercado" />
            <FormControlLabel value="Grupos Focales y/o Design Thinking" control={<Radio />} label="Grupos Focales y/o Design Thinking" />
            <FormControlLabel value="Requisitos y Necesidades de las Partes Interesadas (oferta cerrada)" control={<Radio />} label="Requisitos y Necesidades de las Partes Interesadas (oferta cerrada)" />
            <FormControlLabel value="Oportunidad en la Transferencia de Conocimiento" control={<Radio />} label="Oportunidad en la Transferencia de Conocimiento" />
            <FormControlLabel value="Otras entradas (especificar en justificación)" control={<Radio />} label="Otras entradas (especificar en justificación)" />
            <FormControlLabel value="Resultado de Investigaciones" control={<Radio />} label="Resultado de Investigaciones" />
            <FormControlLabel value="Propuestas de Programas de Educación Continua Anteriores" control={<Radio />} label="Propuestas de Programas de Educación Continua Anteriores" />
            { formData.tipo_programa || formData.programa == 'Modificación de Programa' &&(
            <FormControlLabel value="No aplica" control={<Radio />} label="No aplica" />

)          }
          </RadioGroup>
          {errors?.entradas_diseño && <FormHelperText>{errors.entradas_diseño}</FormHelperText>}
        </FormControl>
        </Grid>
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

import { Grid, TextField, Tooltip } from '@mui/material';
import PropTypes from "prop-types";

function Step2({ formData, handleInputChange, errors }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Sección inicial cuyo propósito principal es contextualizar el texto y normalmente se describe el alcance del documento, y se da una breve explicación o resumen del mismo. También se puede explicar algunos antecedentes que son importantes para el posterior desarrollo del tema central.</span>}>
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
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Es la base, lo que sustenta el proyecto, permiten tener una visión concreta y clara de lo que se hará a largo plazo el objetivo general es único, y los pasos que se seguirán para conseguir dicho propósito.</span>}>
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
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Son enunciados proposicionales desagregados, desentrañados de un objetivo general, que sin excederlo, lo especifican, a nivel cualitativo y cuantitativo.</span>}>
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
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
      <Tooltip title={<span style={{ fontSize: '15px' }}>Exponer las razones por las cuales se quiere realizar la actividad de extensión. Toda actividad debe realizarse con un propósito definido. Debe explicar el por qué es conveniente, el para qué de la actividad y cuáles son los beneficios que se esperan.</span>}>
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
      </Tooltip>
      </Grid>

      <Grid item xs={12}>
      <Tooltip title={<span style={{ fontSize: '15px' }}>Hace referencia al conjunto de procedimientos racionales utilizados para alcanzar los objetivos los propuestos.</span>}>
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
        </Tooltip>
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

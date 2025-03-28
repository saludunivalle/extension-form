import { Typography, Box, TextField } from '@mui/material';
import PropTypes from "prop-types";

function Step1FormSection3({ formData, handleInputChange, errors }) {
  return (
    <Box>
      {/* Propósito */}
      <Typography variant="h6" gutterBottom>PROPÓSITO</Typography>
      <TextField
        label="Definir los posibles riesgos asociados en el diseño y desarrollo de programas de educación continua."
        name="proposito"
        value={formData.proposito || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.proposito}
        helperText={errors.proposito}
      />

      {/* Comentario */}
      <Typography variant="h6" gutterBottom>COMENTARIO</Typography>
      <TextField
        label="El seguimiento y/o control del diseño y desarrollo de programas de educación continua está orientado a la verificación del cumplimiento de los requisitos normativos."
        name="comentario"
        value={formData.comentario || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.comentario}
        helperText={errors.comentario}
      />

      {/* Programa */}
      <Typography variant="h6" gutterBottom>PROGRAMA</Typography>
      <TextField
        label="Programa"
        name="programa"
        value={formData.programa || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.programa}
        helperText={errors.programa}
      />

      {/* Fecha (deshabilitado) */}
      <TextField
        label="Fecha"
        type="date"
        fullWidth
        name="fecha_solicitud"
        value={formData.fecha_solicitud || ''}
        onChange={handleInputChange}
        InputLabelProps={{
          shrink: true,
        }}
        required
        sx={{ marginTop: 2, marginBottom: 2 }}
        disabled
      />

      {/* Elaborado por (deshabilitado) */}
      <Typography variant="h6" gutterBottom>ELABORADO POR</Typography>
      <TextField
        disabled
        label="Elaborado por"
        name="nombre_solicitante"
        value={formData.nombre_solicitante || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
    </Box>
  );
}

Step1FormSection3.propTypes = {
  formData: PropTypes.shape({
    proposito: PropTypes.string,
    comentario: PropTypes.string,
    programa: PropTypes.string,
    fecha_solicitud: PropTypes.string,
    nombre_solicitante: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    proposito: PropTypes.string,
    comentario: PropTypes.string,
    programa: PropTypes.string,
  }).isRequired,
};

export default Step1FormSection3;

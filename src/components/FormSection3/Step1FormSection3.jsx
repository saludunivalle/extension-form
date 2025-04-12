import { Typography, Box, TextField, Alert } from '@mui/material';
import PropTypes from "prop-types";
import { useState, useEffect } from 'react';

function Step1FormSection3({ formData, handleInputChange, errors }) {
  const [localErrors, setLocalErrors] = useState({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  
  // Validate fields on change and set local errors
  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return "Este campo es obligatorio";
    }
    return "";
  };

  // Custom handler to validate on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(e);
    
    // Validate and update local errors
    const error = validateField(name, value);
    setLocalErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // Hide validation alert if all fields have values
    if (!error) {
      const allFieldsValid = ['proposito', 'comentario', 'programa'].every(
        field => field === name || !localErrors[field] || (formData[field] && formData[field].trim() !== '')
      );
      if (allFieldsValid) {
        setShowValidationAlert(false);
      }
    }
  };
  
  // Check for external errors (from parent component)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setShowValidationAlert(true);
      setLocalErrors({...errors});
    }
  }, [errors]);

  return (
    <Box>
      
      {/* Propósito */}
      <Typography variant="h6" gutterBottom>
        PROPÓSITO <span style={{ color: 'gray' }}>*</span>
      </Typography>
      <TextField
        label="Definir los posibles riesgos asociados en el diseño y desarrollo de programas de educación continua."
        name="proposito"
        value={formData.proposito || ''}
        onChange={handleChange}
        onBlur={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!localErrors.proposito || !!errors.proposito}
        helperText={localErrors.proposito || errors.proposito || "Campo obligatorio"}
        InputLabelProps={{
          shrink: true,
        }}
      />

      {/* Comentario */}
      <Typography variant="h6" gutterBottom>
        COMENTARIO <span style={{ color: 'gray' }}>*</span>
      </Typography>
      <TextField
        label="El seguimiento y/o control del diseño y desarrollo de programas de educación continua está orientado a la verificación del cumplimiento de los requisitos normativos."
        name="comentario"
        value={formData.comentario || ''}
        onChange={handleChange}
        onBlur={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!localErrors.comentario || !!errors.comentario}
        helperText={localErrors.comentario || errors.comentario || "Campo obligatorio"}
        InputLabelProps={{
          shrink: true,
        }}
      />

      {/* Programa */}
      <Typography variant="h6" gutterBottom>
        PROGRAMA <span style={{ color: 'gray' }}>*</span>
      </Typography>
      <TextField
        label="Programa"
        name="programa"
        value={formData.programa || ''}
        onChange={handleChange}
        onBlur={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!localErrors.programa || !!errors.programa}
        helperText={localErrors.programa || errors.programa || "Campo obligatorio"}
        InputLabelProps={{
          shrink: true,
        }}
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
      
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
        Los campos marcados con <span style={{ color: 'red' }}>*</span> son obligatorios
      </Typography>
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
  }),
};

Step1FormSection3.defaultProps = {
  errors: {},
};

export default Step1FormSection3;

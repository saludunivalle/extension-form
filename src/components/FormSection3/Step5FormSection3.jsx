import { useState } from 'react';
import { Typography, Box, Grid, Checkbox, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from "prop-types";

function Step5FormSection3({ formData, handleInputChange }) {
  const [additionalRisks, setAdditionalRisks] = useState([]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };

  const addNewRisk = () => {
    const newIndex = additionalRisks.length;
    setAdditionalRisks([...additionalRisks, newIndex]);
  };

  const handleCustomRiskChange = (index, field, value) => {
    handleInputChange({
      target: {
        name: `otrosRiesgos_${index}_${field}`,
        value: value
      }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

      <Grid container spacing={2}>
        {/* Títulos de las columnas */}
        <Grid item xs={4}>
          <Typography variant="subtitle1">RIESGO</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">¿APLICA?</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">MITIGACIÓN</Typography>
        </Grid>

        {/* Riesgo 1 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación de la ejecución de los programas debido a la falta de estrategias de comunicación y baja asistencia por parte de la audiencia (estudiantes) invitados.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre1"
            checked={formData.aplicaCierre1 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre1 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Tener en cuenta que la participación se realiza con el 30% del público invitado. Por tanto, evaluar la cantidad de invitaciones realizadas.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Debilidades en el proceso de verificación del cumplimiento de los requisitos de los estudiantes en el programa de educación continua para la emisión de certificados.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre2"
            checked={formData.aplicaCierre2 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre2 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Verificar los requisitos obligatorios para entregar la certificación.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa desarrollado.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaCierre3"
            checked={formData.aplicaCierre3 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaCierre3 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar seguimiento a encuestas de satisfacción y a comentarios de los estudiantes.
          </Typography>
        </Grid>

      </Grid>

      {/* Riesgos adicionales comentados */}
      <Box mt={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - OTROS</Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addNewRisk}
            sx={{
              borderColor: '#0056b3',
              color: '#0056b3',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#003b82'
              }
            }}
          >
            Agregar Nuevo Riesgo
          </Button>
        </Box>

        {additionalRisks.map((index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={4}>
          <TextField
                fullWidth
                label="Nombre del riesgo"
                variant="outlined"
                onChange={(e) => handleCustomRiskChange(index, 'riesgo', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    fieldset: { borderColor: '#e0e0e0' }
                  }
                }}
              />
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name={`otrosRiesgos_${index}_aplica`}
              onChange={(e) => handleCustomRiskChange(index, 'aplica', e.target.checked ? 'Sí' : 'No')}
              sx={{ padding: '8px' }}
            />
            <Typography variant="body2" color="textSecondary">
              {formData[`otrosRiesgos_${index}_aplica`] === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Mitigación propuesta"
              variant="outlined"
              multiline
              rows={2}
              onChange={(e) => handleCustomRiskChange(index, 'mitigacion', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  fieldset: { borderColor: '#e0e0e0' }
                }
              }}
            />
          </Grid>
        </Grid> 
      ))}
    </Box>
  </Box>
  );
}

Step5FormSection3.propTypes = {
  formData: PropTypes.shape({
    aplicaCierre1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default Step5FormSection3;

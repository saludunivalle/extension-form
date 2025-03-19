import { useState } from 'react';
import { Typography, Box, Grid, Checkbox, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from "prop-types";
import axios from 'axios';

const solicitud3Step5Fields = [
  'aplicaCierre1', 'aplicaCierre2', 'aplicaCierre3',
  'riesgoExtra1', 'riesgoExtra2', 'riesgoExtra3',
  'aplicaExtra1', 'aplicaExtra2', 'aplicaExtra3',
  'mitigaExtra1', 'mitigaExtra2', 'mitigaExtra3'
];

const handleSubmit = async (formData, idSolicitud, userData, setIsLoading, navigate, setCurrentSection) => {
  setIsLoading(true);

  // Construir los datos a enviar para el step 5:
  // Se usan valores por defecto: en checkboxes "No" y en campos de texto vacío.
  const step5Data = {};
  solicitud3Step5Fields.forEach(field => {
    if (field.startsWith('aplica')) {
      step5Data[field] = formData[field] || 'No';
    } else {
      step5Data[field] = formData[field] || '';
    }
  });
  
  try {
    await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
      ...step5Data,
      id_solicitud: idSolicitud,
      paso: 5,
      hoja: 3,
      id_usuario: userData.id_usuario,
      name: userData.name
    });
    // Una vez enviado con éxito, puedes cambiar de sección o notificar al usuario:
    setCurrentSection(4); // Por ejemplo, pasar a la siguiente sección
    navigate(`/formulario/4?solicitud=${idSolicitud}&paso=0`);
  } catch (error) {
    console.error('Error al guardar los datos del último paso:', error.response?.data || error.message);
  } finally {
    setIsLoading(false);
  }
};

function Step5FormSection3({ formData, handleInputChange, idSolicitud, userData, setIsLoading, navigate, setCurrentSection }) {
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
    const newIndex = additionalRisks.length + 1;
    
    // Inicializar todos los campos para el nuevo riesgo
    handleInputChange({
      target: { name: `riesgoExtra${newIndex}`, value: '' }
    });
    handleInputChange({
      target: { name: `aplicaExtra${newIndex}`, value: 'No' }
    });
    handleInputChange({
      target: { name: `mitigaExtra${newIndex}`, value: '' }
    });
  
    setAdditionalRisks([...additionalRisks, newIndex]);
  };

  const handleCustomRiskChange = (index, field, value) => {
    const fieldMap = {
      riesgo: `riesgoExtra${index + 1}`,
      aplica: `aplicaExtra${index + 1}`,
      mitigacion: `mitigaExtra${index + 1}`
    };
    
    handleInputChange({
      target: {
        name: fieldMap[field],
        value: value
      }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

      <Grid container spacing={2}>
        {/* Encabezados */}
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
            Tener en cuenta que la participación se realiza con el 30% del público invitado.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Debilidades en el proceso de verificación del cumplimiento de los requisitos.
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
            Verificar los requisitos para la certificación.
          </Typography>
        </Grid>
        
        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen de la institución por insatisfacción en calidad de contenidos.
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
            Seguimiento a encuestas de satisfacción.
          </Typography>
        </Grid>
      </Grid>

      {/* Sección de riesgos adicionales */}
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

Step5FormSection3.defaultProps = {
  navigate: () => {},
  setCurrentSection: () => {},
};

Step5FormSection3.propTypes = {
  formData: PropTypes.shape({ /* ... */ }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  setIsLoading: PropTypes.func.isRequired,
  navigate: PropTypes.func, // ya no isRequired
  setCurrentSection: PropTypes.func, // ya no isRequired
};

export default Step5FormSection3;

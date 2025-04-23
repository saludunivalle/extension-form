import { Typography, Box, Grid, Checkbox } from '@mui/material';
import PropTypes from "prop-types";
import OtrosRiesgos from './OtrosRiesgos'; // Importar el componente para riesgos dinámicos

function Step5FormSection3({ formData, handleInputChange, idSolicitud, userData, setIsLoading, navigate, setCurrentSection }) {
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };
  
  // Función para determinar estilo de fila basado en estado 'aplicado'
  const getRiskRowStyle = (isApplied) => ({
    padding: '16px 0', // Aumentado para mejor espaciado
    opacity: isApplied ? 1 : 0.7, // Contraste más sutil
    backgroundColor: isApplied ? '#FFFFFF' : 'rgba(0, 0, 0, 0.02)', // Fondo blanco para seleccionados
    transition: 'all 0.25s ease',
    borderRadius: '4px',
    boxShadow: isApplied ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', // Sombra sutil en lugar de borde
    border: 'none', // Eliminamos bordes visibles
    marginBottom: '12px', // Más espacio entre filas
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - CIERRE</Typography>

      <Grid container spacing={2} sx={{ marginBottom: '8px', fontWeight: 'bold', padding: '8px 0' }}>
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
      </Grid>

      {/* Riesgo 1 */}
      <Grid 
        container 
        spacing={2} 
        marginTop={1}
        sx={getRiskRowStyle(formData.aplicaCierre1 === 'Sí')}
      >
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
      </Grid>

      {/* Riesgo 2 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaCierre2 === 'Sí')}
      >
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
      </Grid>
      
      {/* Riesgo 3 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaCierre3 === 'Sí')}
      >
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

      {/* Agregar la sección de otros riesgos de cierre */}
      {idSolicitud && userData && (
        <OtrosRiesgos 
          idSolicitud={idSolicitud} 
          userData={userData} 
          categoria="cierre" 
        />
      )}
    </Box>
  );
}

Step5FormSection3.defaultProps = {
  navigate: () => {},
  setCurrentSection: () => {},
};

Step5FormSection3.propTypes = {
  formData: PropTypes.shape({
    aplicaCierre1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaCierre3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  setIsLoading: PropTypes.func.isRequired,
  navigate: PropTypes.func,
  setCurrentSection: PropTypes.func,
};

export default Step5FormSection3;
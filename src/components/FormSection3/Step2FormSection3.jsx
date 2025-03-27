import { Typography, Box, Grid, Checkbox} from '@mui/material';
import PropTypes from "prop-types";

function Step2FormSection3({ formData, handleInputChange }) {
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
    padding: '16px 0', 
    opacity: isApplied ? 1 : 0.7, 
    backgroundColor: isApplied ? '#FFFFFF' : 'rgba(0, 0, 0, 0.02)', 
    transition: 'all 0.25s ease',
    borderRadius: '4px',
    boxShadow: isApplied ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', 
    border: 'none', // Eliminamos bordes visibles
    marginBottom: '12px', // Más espacio entre filas
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DISEÑO</Typography>

      {/* Títulos de las columnas */}
      <Grid container spacing={2} sx={{ marginBottom: '8px', fontWeight: 'bold', padding: '8px 0' }}>
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
        sx={getRiskRowStyle(formData.aplicaDiseno1 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de competitividad educativa debido a bajas actividades de promoción y mercadeo.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaDiseno1"
            checked={formData.aplicaDiseno1 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaDiseno1 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Realizar estudios de mercado para identificar las necesidades y expectativas de los participantes.
          </Typography>
        </Grid>
      </Grid>

      {/* Riesgo 2 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaDiseno2 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
           Deserción y/o pérdida de mercado en la educación superior por falta de valor agregado en la oferta de programas de extensión en educación continua
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaDiseno2"
            checked={formData.aplicaDiseno2 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaDiseno2 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Mantener programas ajustados a la vanguardia académica y de actualidad.
          </Typography>
        </Grid>
      </Grid>

      {/* Riesgo 3 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaDiseno3 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
           Afectación en el desarrollo de programas de educación Continua y perdida de habilidades y competencias en diversos campos de formación académica por la inadecuada elaboración de presupuesto.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaDiseno3"
            checked={formData.aplicaDiseno3 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaDiseno3 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Cotizar y evaluar precios de mercado reales.
          </Typography>
        </Grid>
      </Grid>

      {/* Riesgo 4 */}
      <Grid 
        container 
        spacing={2} 
        sx={getRiskRowStyle(formData.aplicaDiseno4 === 'Sí')}
      >
        <Grid item xs={4}>
          <Typography variant="body1">
          Propuesta no aprobada por el Consejo de Facultad o Consejo de Regionalización debido al incumplimiento en los pasos o requerimientos para el diseño y desarrollo de programas de educación continua.
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            name="aplicaDiseno4"
            checked={formData.aplicaDiseno4 === 'Sí'}
            onChange={handleCheckboxChange}
          />
          <Typography variant="body2" color="textSecondary">
            {formData.aplicaDiseno4 === 'Sí' ? 'Sí aplica' : 'No aplica'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
           Seguir el paso a paso del proceso
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

Step2FormSection3.propTypes = {
  formData: PropTypes.shape({
    aplicaDiseno1: PropTypes.string,
    aplicaDiseno2: PropTypes.string,
    aplicaDiseno3: PropTypes.string,
    aplicaDiseno4: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default Step2FormSection3;
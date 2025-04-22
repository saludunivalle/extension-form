import { Typography, Box, Grid, Checkbox } from '@mui/material';
import PropTypes from "prop-types";
import OtrosRiesgos from './OtrosRiesgos'; // Importar el nuevo componente

function Step3FormSection3({ formData, handleInputChange, idSolicitud, userData }) {
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
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - LOCACIONES</Typography>

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
        <Grid 
          container 
          spacing={2} 
          marginTop={1}
          sx={getRiskRowStyle(formData.aplicaLocacion1 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en el desarrollo de programas de educación continua debido a la falta de espacio (salones, salas, auditorios) para la ejecución de la actividad.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaLocacion1"
              checked={formData.aplicaLocacion1 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaLocacion1 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Contar con un listado de auditorios, salones y lugares para desarrollar la actividad.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 2 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaLocacion2 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en el desarrollo de programas de educación continua debido mal estado de las instalaciones locativas.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaLocacion2"
              checked={formData.aplicaLocacion2 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaLocacion2 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Proyección de inversiones locativas o buscar un nuevo lugar para realizar los eventos de Educación Continua.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 3 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaLocacion3 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en el desarrollo de programas de educación continua debido a la falta de recursos tecnológicos para el desarrollo de las actividades (equipos de computo, aire acondicionado).
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaLocacion3"
              checked={formData.aplicaLocacion3 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaLocacion3 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Planificar con antelación el inventario de los mismos. <br />
              Realizar pruebas exhaustivas antes del inicio actividades. <br />
              Asegurar que haya soporte técnico disponible para resolver problemas rápidamente.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 4 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaLocacion4 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la ejecución de programas de educación continua por cierre, bloqueos o factores externos (Inundaciones, temblores, etc.) en el campus Universitario.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaLocacion4"
              checked={formData.aplicaLocacion4 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaLocacion4 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Tener lugares alternativos para realizar el evento, debe incluirse en el rubro de imprevistos. <br />
              Mantener un plan de trabajo virtual, remoto o asistido por tecnologías cuando no se pueda dictar el programa de manera presencial.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 5 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaLocacion5 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la ejecución de programas de educación continua debido a problemas tecnológicos como fallas de conectividad.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaLocacion5"
              checked={formData.aplicaLocacion5 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaLocacion5 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Validar la conexión del lugar donde se impartirá el curso con suficiente tiempo el día del evento o días anteriores.
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      {/* Agregar la sección de otros riesgos de locaciones */}
      {idSolicitud && userData && (
        <OtrosRiesgos 
          idSolicitud={idSolicitud} 
          userData={userData} 
          categoria="locaciones" 
        />
      )}
    </Box>
  );
}

// Actualizar PropTypes
Step3FormSection3.propTypes = {
  formData: PropTypes.shape({
    aplicaLocacion1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion4: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaLocacion5: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
};

export default Step3FormSection3;
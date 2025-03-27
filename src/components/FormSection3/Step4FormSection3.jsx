import { Typography, Box, Grid, Checkbox } from '@mui/material';
import PropTypes from "prop-types";

function Step4FormSection3({ formData, handleInputChange }) {
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
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DESARROLLO</Typography>

      <Grid container spacing={2} sx={{ marginBottom: '8px', fontWeight: 'bold', padding: '8px 0' }}>
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
      </Grid>

        {/* Riesgo 1 */}
        <Grid 
          container 
          spacing={2} 
          marginTop={1}
          sx={getRiskRowStyle(formData.aplicaDesarrollo1 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Pérdida de competitividad y de mercado debido a programas de educación continua desactualizados y con contenido no pertinente.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo1"
              checked={formData.aplicaDesarrollo1 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo1 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Asegurar que los contenidos sean revisados y validados, implementar un proceso de actualización periódica del contenido.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 2 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo2 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Pérdida de competitividad y de mercado por falta de innovación en las técnicas efectivas de enseñanza para el público objetivo.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo2"
              checked={formData.aplicaDesarrollo2 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo2 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Investigar y probar diferentes metodologías de enseñanza antes de implementarlas.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 3 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo3 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la ejecución de programas de educación continua por falta de compromiso y competencia profesional docente.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo3"
              checked={formData.aplicaDesarrollo3 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo3 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Proporcionar capacitación continua para instructores en técnicas pedagógicas y uso de tecnologías.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 4 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo4 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la certificación de los programas de educación continua debido a la débil planificación de la etapa evaluación de los conocimientos o habilidades adquiridas.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo4"
              checked={formData.aplicaDesarrollo4 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo4 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Crear evaluaciones que reflejen adecuadamente los objetivos del curso. <br />
              Revisar y ajustar las evaluaciones basándose en el feedback de los participantes.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 5 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo5 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en el cronograma de ejecución de los programas de educación continua por cambios en los horarios sin previo aviso a los interesados.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo5"
              checked={formData.aplicaDesarrollo5 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo5 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Reprogramar actividades.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 6 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo6 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la ejecución de los programas de educación continua por incumplimiento en el calendario y/o apertura de los mismos.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo6"
              checked={formData.aplicaDesarrollo6 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo6 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Establecer canales de comunicación con estudiantes, docentes y personal de la Universidad, ya sea a través de redes sociales, email, llamadas telefónicas o grupos de WhatsApp.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 7 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo7 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Incumplimientos a los roles definidos en los programas de educación continua debido a la falta de asistencia del Director o Coordinador.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo7"
              checked={formData.aplicaDesarrollo7 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo7 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Debe existir alguien que se encargue de verificar la asistencia o delegación para la actividad durante el diseño del programa.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 8 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo8 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación en la ejecución de los programas de educación continua por falta de asistencia del docente, conferencista, orador o invitado especial.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo8"
              checked={formData.aplicaDesarrollo8 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo8 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Tener un listado de profesores que aborden temas relacionados y afines.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 9 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo9 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Afectación del alcance de los objetivos de los programas de educación continua por participantes que no adquieren las competencias necesarias.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo9"
              checked={formData.aplicaDesarrollo9 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo9 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Asegurar que los participantes adquieren conocimientos y habilidades relevantes.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 10 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo10 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa desarrollado.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo10"
              checked={formData.aplicaDesarrollo10 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo10 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Mejorar la experiencia y satisfacción de los participantes para aumentar las tasas de retención y obtener recomendaciones positivas.
            </Typography>
          </Grid>
        </Grid>

        {/* Riesgo 11 */}
        <Grid 
          container 
          spacing={2} 
          sx={getRiskRowStyle(formData.aplicaDesarrollo11 === 'Sí')}
        >
          <Grid item xs={4}>
            <Typography variant="body1">
              Deserción y/o pérdida de mercado en la educación superior por falta de interés o relevancia percibida.
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              name="aplicaDesarrollo11"
              checked={formData.aplicaDesarrollo11 === 'Sí'}
              onChange={handleCheckboxChange}
            />
            <Typography variant="body2" color="textSecondary">
              {formData.aplicaDesarrollo11 === 'Sí' ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              Mantener el contenido actualizado con las últimas tendencias y conocimientos en la materia.
            </Typography>
          </Grid>
        </Grid>
    </Box>
  );
}

Step4FormSection3.propTypes = {
  formData: PropTypes.shape({
    aplicaDesarrollo1: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo3: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo4: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo5: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo6: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo7: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo8: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo9: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo10: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    aplicaDesarrollo11: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default Step4FormSection3;
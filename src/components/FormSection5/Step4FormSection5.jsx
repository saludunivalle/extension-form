import React from 'react';
import { Typography, Box, Grid, Checkbox } from '@mui/material';

function Step4FormSection5({ formData, handleInputChange }) {
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleInputChange({
      target: {
        name,
        value: checked ? 'Sí' : 'No',
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>MATRIZ DE RIESGOS - DESARROLLO</Typography>

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
            Pérdida de competitividad y de mercado debido a programas de educación continua desactualizados y con contenido no pertinente.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo1"
            checked={formData.aplicaDesarrollo1 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Asegurar que los contenidos sean revisados y validados, implementar un proceso de actualización periódica del contenido.
          </Typography>
        </Grid>

        {/* Riesgo 2 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de competitividad y de mercado por falta de innovación en las técnicas efectivas de enseñanza para el público objetivo.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo2"
            checked={formData.aplicaDesarrollo2 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Investigar y probar diferentes metodologías de enseñanza antes de implementarlas.
          </Typography>
        </Grid>

        {/* Riesgo 3 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la ejecución de programas de educación continua por falta de compromiso y competencia profesional docente.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo3"
            checked={formData.aplicaDesarrollo3 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Proporcionar capacitación continua para instructores en técnicas pedagógicas y uso de tecnologías.
          </Typography>
        </Grid>

        {/* Riesgo 4 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la certificación de los programas de educación continua debido a la débil planificación de la etapa evaluación de los conocimientos o habilidades adquiridas.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo4"
            checked={formData.aplicaDesarrollo4 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Crear evaluaciones que reflejen adecuadamente los objetivos del curso. <br />
            Revisar y ajustar las evaluaciones basándose en el feedback de los participantes.
          </Typography>
        </Grid>

        {/* Riesgo 5 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en el cronograma de ejecución de los programas de educación continua por cambios en los horarios sin previo aviso a los interesados.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo5"
            checked={formData.aplicaDesarrollo5 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Reprogramar actividades.
          </Typography>
        </Grid>

        {/* Riesgo 6 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la ejecución de los programas de educación continua por incumplimiento en el calendario y/o apertura de los mismos.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo6"
            checked={formData.aplicaDesarrollo6 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Establecer canales de comunicación con estudiantes, docentes y personal de la Universidad, ya sea a través de redes sociales, email, llamadas telefónicas o grupos de WhatsApp.
          </Typography>
        </Grid>

        {/* Riesgo 7 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Incumplimientos a los roles definidos en los programas de educación continua debido a la falta de asistencia del Director o Coordinador.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo7"
            checked={formData.aplicaDesarrollo7 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Debe existir alguien que se encargue de verificar la asistencia o delegación para la actividad durante el diseño del programa.
          </Typography>
        </Grid>

        {/* Riesgo 8 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación en la ejecución de los programas de educación continua por falta de asistencia del docente, conferencista, orador o invitado especial.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo8"
            checked={formData.aplicaDesarrollo8 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Tener un listado de profesores que aborden temas relacionados y afines.
          </Typography>
        </Grid>

        {/* Riesgo 9 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Afectación del alcance de los objetivos de los programas de educación continua por participantes que no adquieren las competencias necesarias.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo9"
            checked={formData.aplicaDesarrollo9 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Asegurar que los participantes adquieren conocimientos y habilidades relevantes.
          </Typography>
        </Grid>

        {/* Riesgo 10 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Pérdida de imagen y percepción de la institución debido a la insatisfacción de los participantes con relación a la calidad de los contenidos del programa desarrollado.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo10"
            checked={formData.aplicaDesarrollo10 || false}
            onChange={handleCheckboxChange}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            Mejorar la experiencia y satisfacción de los participantes para aumentar las tasas de retención y obtener recomendaciones positivas.
          </Typography>
        </Grid>

        {/* Riesgo 11 */}
        <Grid item xs={4}>
          <Typography variant="body1">
            Deserción y/o pérdida de mercado en la educación superior por falta de interés o relevancia percibida.
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Checkbox
            name="aplicaDesarrollo11"
            checked={formData.aplicaDesarrollo11 || false}
            onChange={handleCheckboxChange}
          />
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

export default Step4FormSection5;

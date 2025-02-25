import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function Step4({ formData, handleInputChange, errors }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Nombre del Coordinador de la Actividad"
              fullWidth
              name="nombre_coordinador"
              value={formData.nombre_coordinador}
              onChange={handleInputChange}
              required
              error={!!errors.nombre_coordinador}
              helperText={errors.nombre_coordinador}
              
            />
          </Grid>
          <Grid item xs={4}>
          <TextField
              label="Correo del Coordinador"
              fullWidth
              name="correo_coordinador"
              value={formData.correo_coordinador}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange(e); // Actualiza el estado global del formulario
                // Validación en tiempo real
                const esValido = emailRegex.test(value);
                
                if (!esValido && value !== "") {
                  errors.correo_coordinador = "Formato de correo inválido";
                } else {
                  errors.correo_coordinador = "";
                }
              }}
              onBlur={(e) => { // Validación adicional al salir del campo
                if (!e.target.value) {
                  errors.correo_coordinador = "Campo obligatorio";
                }
              }}
              required
              error={!!errors.correo_coordinador}
              helperText={errors.correo_coordinador}
              inputProps={{
                type: "email",
                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
              }}
            />

          </Grid>
          <Grid item xs={4}>
          <TextField
              label="Teléfono/Celular del Coordinador"
              fullWidth
              name="tel_coordinador"
              value={formData.tel_coordinador}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,15}$/.test(value)) { // Aceptar solo hasta 15 dígitos
                  handleInputChange(e); // Aceptar solo números
                  // Validación en tiempo real
                  const esValido = value.length >= 7 && value.length <= 15;
                  errors.tel_coordinador = esValido ? "" : "Mínimo 7 dígitos, máximo 15";
                }
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]{7,15}"
              }}
              required
              error={!!errors.tel_coordinador}
              helperText={errors.tel_coordinador}
            />

          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          {/* <Grid item xs={6}>
            <TextField
              label="Profesor(es) que participan"
              fullWidth
              multiline
              rows={4}
              name="profesor_participante"
              value={formData.profesor_participante}
              onChange={handleInputChange}
              required
            />
          </Grid> */}
          <Grid item xs={6}>
            <TextField
              label="Perfil Competencia (educación, experiencia, formación) que debe tener el personal docente, coordinador o ejecutor que va a desarrollar las actividades de extensión"
              fullWidth
              multiline
              rows={4}
              name="perfil_competencia"
              value={formData.perfil_competencia}
              onChange={handleInputChange}
              required
              error={!!errors.perfil_competencia}
              helperText={errors.perfil_competencia}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Formas de Evaluación"
              fullWidth
              multiline
              rows={4}
              name="formas_evaluacion"
              value={formData.formas_evaluacion}
              onChange={handleInputChange}
              required
              error={!!errors.formas_evaluacion}
              helperText={errors.formas_evaluacion}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.certificado_solicitado} required>
          <FormLabel component="legend">Certificado o constancia que solicita expedir</FormLabel>
          <RadioGroup
            row
            name="certificado_solicitado"
            value={formData.certificado_solicitado || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="De asistencia" control={<Radio />} label="De asistencia" />
            <FormControlLabel value="De aprobación" control={<Radio />} label="De aprobación" />
            <FormControlLabel value="No otorga certificado" control={<Radio />} label="No otorga certificado" />
          </RadioGroup>
          {errors.certificado_solicitado && <FormHelperText>{errors.certificado_solicitado}</FormHelperText>}
        </FormControl>
      </Grid>

      {formData.certificado_solicitado === "De aprobación" && (
        <Grid item xs={12}>
          <TextField
            label="Calificación mínima con la cual se aprueba"
            fullWidth
            name="calificacion_minima"
            value={formData.calificacion_minima}
            onChange={handleInputChange}
            required
            error={!!errors.calificacion_minima}
            helperText={errors.calificacion_minima}
          />
        </Grid>
      )}

      {formData.certificado_solicitado === "No otorga certificado" && (
        <Grid item xs={12}>
          <TextField
            label="Razón por la cual no se otorga certificado"
            fullWidth
            name="razon_no_certificado"
            value={formData.razon_no_certificado}
            onChange={handleInputChange}
            required
            error={!!errors.razon_no_certificado}
            helperText={errors.razon_no_certificado}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          label="Valor unitario del programa EC expresado en SMMLV"
          fullWidth
          name="valor_inscripcion"
          value={formData.valor_inscripcion}
          onChange={(e) => {
            // Eliminar todos los caracteres no numéricos excepto números
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
            handleInputChange({
              target: {
                name: e.target.name,
                value: numericValue
              }
            });
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*"
          }}
      
          error={!!errors.valor_inscripcion}
          helperText={
            formData.valor_inscripcion === 0 ? "El programa es sin costo" : 
            `Valor unitario: $${new Intl.NumberFormat('es-CO').format(formData.valor_inscripcion)} COP`
          }
        />
      </Grid>
    </Grid>
  );
}

Step4.propTypes = {
  formData: PropTypes.shape({
    nombre_coordinador: PropTypes.string,
    correo_coordinador: PropTypes.string,
    tel_coordinador: PropTypes.string,
    perfil_competencia: PropTypes.string,
    formas_evaluacion: PropTypes.string,
    certificado_solicitado: PropTypes.string,
    calificacion_minima: PropTypes.string,
    razon_no_certificado: PropTypes.string,
    valor_inscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    nombre_coordinador: PropTypes.string,
    correo_coordinador: PropTypes.string,
    tel_coordinador: PropTypes.string,
    perfil_competencia: PropTypes.string,
    formas_evaluacion: PropTypes.string,
    certificado_solicitado: PropTypes.string,
    calificacion_minima: PropTypes.string,
    razon_no_certificado: PropTypes.string,
    valor_inscripcion: PropTypes.string
  }).isRequired,
};

export default Step4;

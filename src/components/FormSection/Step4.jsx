import { useEffect } from 'react';
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';

const SMMLV = 1750905;

const validateEmail = (email) => {
  // Usamos test() en lugar de intentar convertir el regex a string
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const formatCop = (value) => {
  const numeric = Number(value || 0);
  if (!numeric) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

function Step4({ formData, handleInputChange, errors }) {
  useEffect(() => {
    if (formData.tipo_valor === 'valor_unitario') {
      const unitValue = Number(formData.valor_unitario || 0);
      const calculatedPesos = Math.round(unitValue * SMMLV);
      const currentPesos = Number(formData.valor_inscripcion || 0);

      if (!Number.isNaN(unitValue) && calculatedPesos !== currentPesos) {
        handleInputChange({
          target: {
            name: 'valor_inscripcion',
            value: calculatedPesos,
          },
        });
      }
    }

    if (formData.tipo_valor === 'cifra_pesos') {
      const pesos = Number(formData.valor_inscripcion || 0);
      const calculatedUnitValue = pesos === 0 ? 0 : parseFloat((pesos / SMMLV).toFixed(4));
      const currentUnitValue = Number(formData.valor_unitario || 0);

      if (!Number.isNaN(pesos) && calculatedUnitValue !== currentUnitValue) {
        handleInputChange({
          target: {
            name: 'valor_unitario',
            value: calculatedUnitValue,
          },
        });
      }
    }
  }, [formData.tipo_valor, formData.valor_unitario, formData.valor_inscripcion, handleInputChange]);

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
                handleInputChange(e);
                const isValid = e.target.value ? validateEmail(e.target.value) : true;
                // Actualizar el error directamente aquí si es necesario
                if (!isValid && e.target.value) {
                  errors.correo_coordinador = "Correo electrónico inválido";
                } else if (isValid) {
                  // Limpiar el error si el correo es válido
                  delete errors.correo_coordinador;
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
              name="pefil_competencia"
              value={formData.pefil_competencia}
              onChange={handleInputChange}
              required
              error={!!errors.pefil_competencia}
              helperText={errors.pefil_competencia}
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
        <FormControl component="fieldset" required error={!!errors.tipo_valor}>
          <FormLabel component="legend">Tipo de valor a registrar</FormLabel>
          <RadioGroup
            row
            name="tipo_valor"
            value={formData.tipo_valor || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="valor_unitario" control={<Radio />} label="Valor unitario (SMMLV)" />
            <FormControlLabel value="cifra_pesos" control={<Radio />} label="Cifra en pesos (COP)" />
          </RadioGroup>
          {errors.tipo_valor && <FormHelperText>{errors.tipo_valor}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Valor unitario (SMMLV)"
          fullWidth
          name="valor_unitario"
          value={formData.valor_unitario ?? ''}
          onChange={(e) => {
            const rawValue = String(e.target.value || '').trim();

            if (rawValue === '') {
              handleInputChange({ target: { name: 'valor_unitario', value: '' } });
              handleInputChange({ target: { name: 'valor_inscripcion', value: 0 } });
              return;
            }

            if (!/^\d{0,2}([.,]\d{0,2})?$/.test(rawValue)) {
              return;
            }

            const unitValue = parseFloat(rawValue.replace(',', '.'));
            if (Number.isNaN(unitValue)) return;

            handleInputChange({ target: { name: 'valor_unitario', value: unitValue } });
            handleInputChange({ target: { name: 'valor_inscripcion', value: Math.round(unitValue * SMMLV) } });
          }}
          placeholder="Ej: 10,5"
          disabled={formData.tipo_valor !== 'valor_unitario'}
          error={!!errors.valor_unitario}
          helperText={
            formData.tipo_valor === 'valor_unitario'
              ? `SMMLV vigente: ${new Intl.NumberFormat('es-CO').format(SMMLV)} COP`
              : 'Seleccione "Valor unitario" para editar este campo'
          }
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Valor de inscripción (COP) *"
          fullWidth
          name="valor_inscripcion"
          value={formatCop(formData.valor_inscripcion)}
          onChange={(e) => {
            // Eliminar todos los caracteres no numéricos excepto números
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);

            const calculatedUnitValue = numericValue === 0 ? 0 : parseFloat((numericValue / SMMLV).toFixed(4));

            handleInputChange({
              target: {
                name: e.target.name,
                value: numericValue
              }
            });

            handleInputChange({
              target: {
                name: 'valor_unitario',
                value: calculatedUnitValue,
              },
            });
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*"
          }}
          placeholder="0"
          disabled={formData.tipo_valor === 'valor_unitario'}
          error={!!errors.valor_inscripcion}
          helperText={
            formData.tipo_valor === 'cifra_pesos'
              ? `Equivale a ${Number(formData.valor_unitario || 0).toFixed(4)} SMMLV`
              : formData.valor_inscripcion === 0
                ? "El programa es sin costo"
                : "Calculado automaticamente segun valor unitario"
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
    pefil_competencia: PropTypes.string,
    formas_evaluacion: PropTypes.string,
    certificado_solicitado: PropTypes.string,
    calificacion_minima: PropTypes.string,
    razon_no_certificado: PropTypes.string,
    tipo_valor: PropTypes.string,
    valor_unitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    valor_inscripcion: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    nombre_coordinador: PropTypes.string,
    correo_coordinador: PropTypes.string,
    tel_coordinador: PropTypes.string,
    pefil_competencia: PropTypes.string,
    formas_evaluacion: PropTypes.string,
    certificado_solicitado: PropTypes.string,
    calificacion_minima: PropTypes.string,
    razon_no_certificado: PropTypes.string,
    tipo_valor: PropTypes.string,
    valor_unitario: PropTypes.string,
    valor_inscripcion: PropTypes.string
  }).isRequired,
};

export default Step4;

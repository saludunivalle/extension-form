import React from 'react';
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';

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
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                errors.correo_coordinador =
                  emailRegex.test(value) ? "" : "Ingrese un correo válido";
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
                if (/^\d*$/.test(value)) {
                  handleInputChange(e); // Aceptar solo números
                  // Validación en tiempo real
                  const celularColombiaRegex = /^\d{9}$/;
                  errors.tel_coordinador =
                    celularColombiaRegex.test(value)
                      ? ""
                      : "Ingrese un celular válido (10 dígitos)";
                }
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
        <FormControl component="fieldset" required>
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
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          label="Valor unitario del programa EC expresado en SMMLV"
          fullWidth
          name="valor_inscripcion"
          value={formData.valor_inscripcion || '0'}
          onChange={(e) =>
            handleInputChange({
              target: {
                name: e.target.name,
                value: e.target.value === '' ? '0' : e.target.value,
              },
            })
          }
          required
          error={!!errors.valor_inscripcion}
          helperText={errors.valor_inscripcion}
        />
      </Grid>
    </Grid>
  );
}

export default Step4;

import React from 'react';
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';

function Step4({ formData, handleInputChange }) {
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
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Correo del Coordinador"
              fullWidth
              name="correo_coordinador"
              value={formData.correo_coordinador}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Teléfono/Celular del Coordinador"
              fullWidth
              name="tel_coordinador"
              value={formData.tel_coordinador}
              onChange={handleInputChange}
              required
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
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
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Certificado que solicita expedir</FormLabel>
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
          label="Valor de la inscripción en SMMLV"
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
        />
      </Grid>
    </Grid>
  );
}

export default Step4;

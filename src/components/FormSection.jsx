import React from 'react';
import { MenuItem, TextField, Grid, Typography, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, Box } from '@mui/material';

function FormSection({ step, formData, handleInputChange }) {
  return (
    <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
      {step === 0 && (
        <>
          <Grid item xs={12}>
            <TextField
              label="Fecha de la Solicitud"
              type="date"
              fullWidth
              name="fecha_solicitud"
              value={formData.fecha_solicitud}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nombre de la Actividad"
              fullWidth
              name="nombre_actividad"
              value={formData.nombre_actividad}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nombre del Solicitante"
              fullWidth
              name="nombre_solicitante"
              value={formData.nombre_solicitante}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Dependencia"
              fullWidth
              name="nombre_dependencia"
              value={formData.nombre_dependencia}
              onChange={handleInputChange}
            >
              <MenuItem value="Escuela">Escuela</MenuItem>
              <MenuItem value="Departamento">Departamento</MenuItem>
              <MenuItem value="Sección">Sección</MenuItem>
              <MenuItem value="Programa">Programa</MenuItem>
              <MenuItem value="Oficinas">Oficinas</MenuItem>
            </TextField>
          </Grid>
        </>
      )}

      {step === 1 && (
        <>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo</FormLabel>
              <RadioGroup
                row
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Curso" control={<Radio />} label="Curso" />
                <FormControlLabel value="Congreso" control={<Radio />} label="Congreso" />
                <FormControlLabel value="Conferencia" control={<Radio />} label="Conferencia" />
                <FormControlLabel value="Simposio" control={<Radio />} label="Simposio" />
                <FormControlLabel value="Diplomado" control={<Radio />} label="Diplomado" />
                <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
              </RadioGroup>
              {formData.tipo === 'Otro' && (
                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    label="¿Cuál?"
                    fullWidth
                    name="otro_tipo"
                    value={formData.otro_tipo || ''}
                    onChange={handleInputChange}
                  />
                </Box>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Modalidad</FormLabel>
              <RadioGroup
                row
                name="modalidad"
                value={formData.modalidad}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Presencial" control={<Radio />} label="Presencial" />
                <FormControlLabel value="Semipresencial" control={<Radio />} label="Semipresencial" />
                <FormControlLabel value="Virtual" control={<Radio />} label="Virtual" />
                <FormControlLabel value="Mixta" control={<Radio />} label="Mixta" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ofrecido por"
              fullWidth
              name="ofrecido_por"
              value={formData.ofrecido_por}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Unidad Académica"
              fullWidth
              name="unidad_academica"
              value={formData.unidad_academica}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ofrecido para"
              fullWidth
              multiline
              rows={4}
              name="ofrecido_para"
              value={formData.ofrecido_para}
              onChange={handleInputChange}
            />
          </Grid>
        </>
      )}

      {step === 2 && (
        <>
          <Grid item xs={12}>
            <TextField
              label="Intensidad Horaria"
              fullWidth
              name="intensidad_horaria"
              value={formData.intensidad_horaria}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Horas de Modalidad"
              fullWidth
              name="horas_modalidad"
              value={formData.horas_modalidad}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Horas de Trabajo Independiente"
              fullWidth
              name="horas_trabj_ind"
              value={formData.horas_trabj_ind}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Créditos"
              fullWidth
              name="creditos"
              value={formData.creditos}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              label="Cupo Mínimo"
              fullWidth
              name="cupo_min"
              value={formData.cupo_min}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              label="Cupo Máximo"
              fullWidth
              name="cupo_max"
              value={formData.cupo_max}
              onChange={handleInputChange}
            />
          </Grid>
        </>
      )}

      {step === 3 && (
        <>
          <Grid item xs={12}>
            <TextField
              label="Nombre del Coordinador de la Actividad"
              fullWidth
              name="nombre_coordinador"
              value={formData.nombre_coordinador}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Teléfono/Celular del Coordinador"
              fullWidth
              name="tel_coordinador"
              value={formData.tel_coordinador}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Profesor(es) que participan"
              fullWidth
              multiline
              rows={4}
              name="profesor_participante"
              value={formData.profesor_participante}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Formas de Evaluación"
              fullWidth
              multiline
              rows={4}
              name="formas_evaluacion"
              value={formData.formas_evaluacion}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Certificado que solicita expedir</FormLabel>
              <RadioGroup
                row
                name="certificado_solicitado"
                value={formData.certificado_solicitado}
                onChange={handleInputChange}
              >
                <FormControlLabel value="De asistencia" control={<Radio />} label="De asistencia" />
                <FormControlLabel value="De aprobación" control={<Radio />} label="De aprobación" />
                <FormControlLabel value="No otorga certificado" control={<Radio />} label="No otorga certificado" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {formData.certificado_solicitado === 'De aprobación' && (
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
          {formData.certificado_solicitado === 'No otorga certificado' && (
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
              value={formData.valor_inscripcion}
              onChange={handleInputChange}
            />
          </Grid>
        </>
      )}

      {step === 4 && (
        <>
          <Grid item xs={12}>
            <FormLabel component="legend">Becas o exenciones</FormLabel>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Convenio Docencia o Servicio"
              fullWidth
              name="becas_convenio"
              value={formData.becas_convenio}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Estudiantes"
              fullWidth
              name="becas_estudiantes"
              value={formData.becas_estudiantes}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Docentes"
              fullWidth
              name="becas_docentes"
              value={formData.becas_docentes}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Otros"
              fullWidth
              name="becas_otros"
              value={formData.becas_otros}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Becas"
              fullWidth
              name="becas_total"
              value={formData.becas_total}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Fechas en las que se llevará a cabo</FormLabel>
              <RadioGroup
                name="fechas_actividad"
                value={formData.fechas_actividad}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Oferta periódica" control={<Radio />} label="Oferta periódica" />
                <FormControlLabel value="Periodo finito" control={<Radio />} label="Periodo finito - fechas por meses" />
                <FormControlLabel value="Fecha inicio - Fecha final" control={<Radio />} label="Fecha inicio - Fecha final" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">La organización de la actividad se hará por</FormLabel>
              <RadioGroup
                name="organizacion_actividad"
                value={formData.organizacion_actividad}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Oficina de Extensión" control={<Radio />} label="Oficina de Extensión" />
                <FormControlLabel value="Unidad Académica" control={<Radio />} label="Unidad Académica" />
                <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
              </RadioGroup>
              {formData.organizacion_actividad === 'Otro' && (
                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    label="¿Cuál?"
                    fullWidth
                    name="organizacion_actividad_otro"
                    value={formData.organizacion_actividad_otro || ''}
                    onChange={handleInputChange}
                  />
                </Box>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              fullWidth
              name="nombre_firma"
              value={formData.nombre_firma}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Cargo"
              fullWidth
              name="cargo_firma"
              value={formData.cargo_firma}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Firma"
              fullWidth
              name="firma"
              value={formData.firma}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Anexo de documento"
              type="file"
              fullWidth
              name="anexo_documento"
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">
              Nota: Esta solicitud debe ir acompañada del presupuesto y de la propuesta inicial (plantilla, documento, formato). Se debe entregar a la Oficina de Extensión de la Facultad, Instituto Académico o Sede, impreso y en medio magnético.
            </Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default FormSection;

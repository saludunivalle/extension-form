import React, { useState, useEffect } from 'react';
import { MenuItem, TextField, Grid, Typography, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, Box, InputLabel, Select } from '@mui/material';
import axios from 'axios';

function FormSection({ step, formData, handleInputChange, escuelas, departamentos, secciones, programas, oficinas }) {

  const calculateDateDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFechaChange = (event, fieldName) => {
    handleInputChange(event);
    if (formData.fecha_inicio && formData.fecha_final) {
      const diffDays = calculateDateDifference(
        fieldName === 'fecha_inicio' ? event.target.value : formData.fecha_inicio,
        fieldName === 'fecha_final' ? event.target.value : formData.fecha_final
      );
      handleInputChange({
        target: {
          name: 'matriz_riesgo_enabled',
          value: diffDays > 14,
        },
      });
    }
  };

  useEffect(() => {
    const totalHoras =
      (parseInt(formData.horas_trabajo_presencial || 0) +
      parseInt(formData.horas_sincronicas || 0)).toString();

    handleInputChange({
      target: {
        name: 'total_horas',
        value: totalHoras,
      },
    });
  }, [formData.horas_trabajo_presencial, formData.horas_sincronicas]);
  
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
            <FormControl component="fieldset">
              <FormLabel component="legend">Dependencia</FormLabel>
              <RadioGroup
                row
                name="dependencia_tipo"
                value={formData.dependencia_tipo || ''}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Escuelas" control={<Radio />} label="Escuelas" />
                <FormControlLabel value="Oficinas" control={<Radio />} label="Oficinas" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {formData.dependencia_tipo === "Escuelas" && (
            <>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Escuela"
                  fullWidth
                  name="nombre_escuela"
                  value={formData.nombre_escuela || ''}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Sin Seleccionar</MenuItem>
                  {escuelas.map((escuela, index) => (
                    <MenuItem key={index} value={escuela}>
                      {escuela}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {formData.nombre_escuela && (
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Departamento"
                    fullWidth
                    name="nombre_departamento"
                    value={formData.nombre_departamento || ''}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Sin Seleccionar</MenuItem>
                    {departamentos.map((departamento, index) => (
                      <MenuItem key={index} value={departamento}>
                        {departamento}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {formData.nombre_departamento && (
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Sección"
                    fullWidth
                    name="nombre_seccion"
                    value={formData.nombre_seccion || ''}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Sin Seleccionar</MenuItem>
                    {secciones.map((seccion, index) => (
                      <MenuItem key={index} value={seccion}>
                        {seccion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {formData.nombre_seccion && (
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Programa"
                    fullWidth
                    name="nombre_dependencia"
                    value={formData.nombre_dependencia || ''}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Sin Seleccionar</MenuItem>
                    {programas
                      .filter((programa, index, self) => 
                        programa && 
                        programa.Programa && 
                        self.findIndex(p => p.Programa === programa.Programa) === index
                      ) 
                      .map((programa, index) => (
                        <MenuItem key={index} value={programa.Programa}>
                          {programa.Programa}
                        </MenuItem>
                    ))}
                    <MenuItem value="General">General</MenuItem>
                  </TextField>
                </Grid>
              )}

            </>
          )}

          {formData.dependencia_tipo === "Oficinas" && (
            <Grid item xs={12}>
              <TextField
                select
                label="Oficinas"
                fullWidth
                name="nombre_dependencia"
                value={formData.nombre_dependencia || ''}
                onChange={handleInputChange}
              >
                {oficinas.map((oficina, index) => (
                  <MenuItem key={index} value={oficina}>
                    {oficina}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
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
                value={formData.tipo || ''}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Curso" control={<Radio />} label="Curso" />
                <FormControlLabel value="Congreso" control={<Radio />} label="Congreso" />
                <FormControlLabel value="Conferencia" control={<Radio />} label="Conferencia" />
                <FormControlLabel value="Simposio" control={<Radio />} label="Simposio" />
                <FormControlLabel value="Diplomado" control={<Radio />} label="Diplomado" />
                <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
              </RadioGroup>
              {formData.tipo === "Otro" && (
                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    label="¿Cuál?"
                    fullWidth
                    name="otro_tipo"
                    value={formData.otro_tipo || ""}
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
                value={formData.modalidad || ''}
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
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo de Oferta</FormLabel>
              <RadioGroup
                row
                name="tipo_oferta"
                value={formData.tipo_oferta || ''}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Oferta Abierta" control={<Radio />} label="Oferta Abierta" />
                <FormControlLabel value="Oferta Cerrada" control={<Radio />} label="Oferta Cerrada" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ofrecido por"
              fullWidth
              name="ofrecido_por"
              value={formData.ofrecido_por || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Unidad Académica"
              fullWidth
              name="unidad_academica"
              value={formData.nombre_dependencia || ''}
              InputProps={{
                readOnly: true,
              }}
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
            <Typography variant="h6">Intensidad Horaria</Typography>
          </Grid>

          {(formData.modalidad === "Presencial" || formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial") && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {(formData.modalidad === "Presencial" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial") && (
                  <Grid item xs={4}>
                    <TextField
                      label="Horas de trabajo Presencial"
                      fullWidth
                      name="horas_trabajo_presencial"
                      value={formData.horas_trabajo_presencial}
                      onChange={handleInputChange}
                    />
                  </Grid>
                )}

                {(formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial") && (
                  <Grid item xs={4}>
                    <TextField
                      label="Horas Sincrónicas"
                      fullWidth
                      name="horas_sincronicas"
                      value={formData.horas_sincronicas}
                      onChange={handleInputChange}
                    />
                  </Grid>
                )}

                <Grid item xs={4}>
                  <TextField
                    label="Total Horas"
                    fullWidth
                    name="total_horas"
                    value={formData.total_horas || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

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
              helperText="Este valor no incluye las becas"
            />
          </Grid>
        </>
      )}

      {step === 3 && (
        <>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Nombre del Coordinador de la Actividad"
                  fullWidth
                  name="nombre_coordinador"
                  value={formData.nombre_coordinador}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Correo del Coordinador"
                  fullWidth
                  name="correo_coordinador"
                  value={formData.correo_coordinador}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Teléfono/Celular del Coordinador"
                  fullWidth
                  name="tel_coordinador"
                  value={formData.tel_coordinador}
                  onChange={handleInputChange}
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
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <TextField
                  label="Convenio Docencia o Servicio"
                  fullWidth
                  name="becas_convenio"
                  type="number"
                  value={formData.becas_convenio}
                  onChange={handleInputChange}
                  inputProps={{ min: "0" }} 
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Estudiantes"
                  fullWidth
                  name="becas_estudiantes"
                  type="number"
                  value={formData.becas_estudiantes}
                  onChange={handleInputChange}
                  inputProps={{ min: "0" }} 
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Docentes"
                  fullWidth
                  name="becas_docentes"
                  type="number"
                  value={formData.becas_docentes}
                  onChange={handleInputChange}
                  inputProps={{ min: "0" }} 
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Otros"
                  fullWidth
                  name="becas_otros"
                  type="number"
                  value={formData.becas_otros}
                  onChange={handleInputChange}
                  inputProps={{ min: "0" }} 
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Total Becas"
                  fullWidth
                  name="becas_total"
                  value={
                    (
                      parseInt(formData.becas_convenio || 0) +
                      parseInt(formData.becas_estudiantes || 0) +
                      parseInt(formData.becas_docentes || 0) +
                      parseInt(formData.becas_otros || 0)
                    ).toString()
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
                  
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Fechas en las que se llevará a cabo</FormLabel>
              <RadioGroup
                name="fechas_actividad"
                value={formData.fechas_actividad || ''}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Oferta periódica" control={<Radio />} label="Oferta periódica" />
                <FormControlLabel value="Periodo finito - fechas por meses" control={<Radio />} label="Periodo finito - fechas por meses" />
                <FormControlLabel value="Fecha inicio - Fecha final" control={<Radio />} label="Fecha inicio - Fecha final" />
              </RadioGroup>

              {formData.fechas_actividad === 'Periodo finito - fechas por meses' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Seleccionar Meses</InputLabel>
                      <Select
                        multiple
                        name="fecha_por_meses"
                        value={Array.isArray(formData.fecha_por_meses) ? formData.fecha_por_meses : formData.fecha_por_meses ? formData.fecha_por_meses.split(', ') : []}
                        onChange={(event) => {
                          const selectedMonths = Array.from(event.target.value);
                          handleInputChange({
                            target: {
                              name: 'fecha_por_meses',
                              value: selectedMonths.join(', '),
                            },
                          });

                          const totalMonths = selectedMonths.length;
                          const enableMatrizRiesgo = totalMonths > 2; 
                          handleInputChange({
                            target: {
                              name: 'matriz_riesgo_enabled',
                              value: enableMatrizRiesgo,
                            },
                          });
                        }}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month) => (
                          <MenuItem key={month} value={month}>
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {formData.fechas_actividad === 'Fecha inicio - Fecha final' && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Fecha de Inicio"
                      type="date"
                      fullWidth
                      name="fecha_inicio"
                      value={formData.fecha_inicio || ''}
                      onChange={(event) => handleFechaChange(event, 'fecha_inicio')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Fecha Final"
                      type="date"
                      fullWidth
                      name="fecha_final"
                      value={formData.fecha_final || ''}
                      onChange={(event) => handleFechaChange(event, 'fecha_final')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom>
              <strong>Visto Bueno de la Unidad Académica</strong><br/>
              Solo aplica en caso de que el Vo.Bo, no haya sido incluido en la Ficha técnica - propuesta de actividades de extensión relacionadas con docencia F-04-MP-05-01-01
            </Typography>
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
              label="Subir Firma"
              type="file"
              fullWidth
              name="archivo_firma"
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {formData.matriz_riesgo_enabled && (
            <Grid item xs={12}>
              <TextField
                label="Matriz de Riesgo"
                type="file"
                fullWidth
                name="matriz_riesgo"
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}
        </>
      )}

    </Grid>
  );
}

export default FormSection;

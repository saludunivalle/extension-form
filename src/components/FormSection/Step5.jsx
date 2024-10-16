import React from 'react';
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, InputLabel, MenuItem } from '@mui/material';

function Step5({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
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
              required
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
              required
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
              required
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
              required
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
              required
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Periodicidad de la Oferta */}
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Periodicidad de la oferta</FormLabel>
          <RadioGroup
            name="periodicidad_oferta"
            value={formData.periodicidad_oferta || ''}
            onChange={handleInputChange}
            required
          >
            <FormControlLabel value="anual" control={<Radio />} label="Anual" />
            <FormControlLabel value="semestral" control={<Radio />} label="Semestral" />
            <FormControlLabel value="permanente" control={<Radio />} label="Permanente" />
          </RadioGroup>
        </FormControl>
      </Grid>
              
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Fechas en las que se llevará a cabo</FormLabel>
          <RadioGroup
            name="fechas_actividad"
            value={formData.fechas_actividad || ''}
            onChange={handleInputChange}
            required
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
                  onChange={(event) => handleInputChange(event)}
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
                  onChange={(event) => handleInputChange(event)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default Step5;

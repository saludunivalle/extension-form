import React from 'react';
import { Grid, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';

function Step1({ formData, handleInputChange, escuelas, departamentos, secciones, programas, oficinas }) {
  return (
    <Grid container spacing={2}>
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
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Nombre de la Actividad"
          fullWidth
          name="nombre_actividad"
          value={formData.nombre_actividad}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Nombre del Solicitante"
          fullWidth
          name="nombre_solicitante"
          value={formData.nombre_solicitante}
          onChange={handleInputChange}
          required
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
              required
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
                disabled={departamentos.length === 1 && departamentos[0] === "General"} // Deshabilitar si solo tiene "General"
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
                disabled={secciones.length === 1 && secciones[0] === "General"} // Deshabilitar si solo tiene "General"
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
              label="Programa Académico"
              fullWidth
              name="nombre_dependencia"
              value={formData.nombre_dependencia || ''}
              onChange={handleInputChange}
            >
              <MenuItem value="">Sin Seleccionar</MenuItem>
              {programas.map((programa, index) => (
                <MenuItem key={index} value={programa.Programa}>
                  {programa.Programa}
                </MenuItem>
              ))}
              <MenuItem value="General">General</MenuItem> {/* Agregar opción General */}
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
    </Grid>
  );
}

export default Step1;

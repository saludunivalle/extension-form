import PropTypes from "prop-types";
import { InputLabel, Select, FormHelperText, Grid, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import { useEffect } from 'react';

function Step1({ formData, handleInputChange, setFormData, escuelas, departamentos, secciones, programas, oficinas, errors }) {
  
  // Auto-select "General" when it's the only option for departamento or sección
  useEffect(() => {
    if (formData.nombre_escuela && departamentos?.length === 1 && departamentos[0] === "General" && !formData.nombre_departamento) {
      // Auto-select "General" for departamento when it's the only option
      setFormData(prev => ({
        ...prev,
        nombre_departamento: "General"
      }));
    }
  }, [formData.nombre_escuela, departamentos, setFormData]);

  useEffect(() => {
    if (formData.nombre_departamento && secciones?.length === 1 && secciones[0] === "General" && !formData.nombre_seccion) {
      // Auto-select "General" for sección when it's the only option
      setFormData(prev => ({
        ...prev,
        nombre_seccion: "General"
      }));
    }
  }, [formData.nombre_departamento, secciones, setFormData]);

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
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          required
          error={!!errors?.fecha_solicitud}
          helperText={errors?.fecha_solicitud}
          onClick={(e) => {
            e.target.showPicker && e.target.showPicker();
          }}
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          InputProps={{
            readOnly: false,
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
          required
          error={!!errors?.nombre_actividad}
          helperText={errors?.nombre_actividad}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Nombre del Solicitante"
          fullWidth
          name="nombre_solicitante"
          value={formData.nombre_solicitante}
          onChange={handleInputChange}
          margin="normal"
          required
          autoComplete="new-password"
          InputProps={{
            autoComplete: 'new-password',
          }}
          InputLabelProps={{ shrink: true }}
          error={!!errors?.nombre_solicitante}
          helperText={errors?.nombre_solicitante}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors?.dependencia_tipo} required>
          <FormLabel component="legend">Dependencia</FormLabel>
          <RadioGroup
            name="dependencia_tipo"
            value={formData.dependencia_tipo || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Escuelas" control={<Radio />} label="Escuelas" />
            <FormControlLabel value="Oficinas" control={<Radio />} label="Oficinas" />
          </RadioGroup>
          {errors?.dependencia_tipo && <FormHelperText>{errors.dependencia_tipo}</FormHelperText>}
        </FormControl>
      </Grid>

      {formData.dependencia_tipo === "Escuelas" && (
        <>
          <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="escuela-label">Escuela</InputLabel>
            <Select
              labelId="escuela-label"
              name="nombre_escuela"
              value={formData?.nombre_escuela || ''}
              onChange={handleInputChange}
              label="Escuela"
            >
              <MenuItem value="">-</MenuItem>
              {Array.isArray(escuelas) ? escuelas.filter(e => e !== "Dirección de Posgrados").map((escuela, index) => (
                <MenuItem key={index} value={escuela || ''}>
                  {escuela || ''}
                </MenuItem>
              )) : null}
            </Select>
            {errors?.nombre_escuela && <FormHelperText error>{errors.nombre_escuela}</FormHelperText>}
          </FormControl>
          </Grid>

          {formData.nombre_escuela && (
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors?.nombre_departamento} 
                disabled={(departamentos?.length === 1 && departamentos[0] === "General")}>
                <InputLabel id="departamento-label">Departamento</InputLabel>
                <Select
                  labelId="departamento-label"
                  name="nombre_departamento"
                  value={formData.nombre_departamento || ''}
                  onChange={handleInputChange}
                  label="Departamento"
                >
                  <MenuItem value="">-</MenuItem>
                  {(departamentos || []).map((departamento, index) => (
                    <MenuItem key={index} value={departamento}>
                      {departamento}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.nombre_departamento && <FormHelperText>{errors.nombre_departamento}</FormHelperText>}
              </FormControl>
            </Grid>
          )}

          {formData.nombre_departamento && (
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors?.nombre_seccion}
                disabled={(secciones?.length === 1 && secciones[0] === "General")}>
                <InputLabel id="seccion-label">Sección</InputLabel>
                <Select
                  labelId="seccion-label"
                  name="nombre_seccion"
                  value={formData.nombre_seccion || ''}
                  onChange={handleInputChange}
                  label="Sección"
                >
                  <MenuItem value="">-</MenuItem>
                  {(secciones || []).map((seccion, index) => (
                    <MenuItem key={index} value={seccion}>
                      {seccion}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.nombre_seccion && <FormHelperText>{errors.nombre_seccion}</FormHelperText>}
              </FormControl>
            </Grid>
          )}

          {formData.nombre_seccion && (
            <Grid item xs={12}>
            <FormControl fullWidth required error={!!errors?.nombre_dependencia}>
              <InputLabel id="programa-label">Programa Académico</InputLabel>
              <Select
                labelId="programa-label"
                name="nombre_dependencia"
                value={formData.nombre_dependencia || ''}
                onChange={handleInputChange}
                label="Programa Académico"
              >
                <MenuItem value="">-</MenuItem>
                {(programas || []).map((programa, index) => (
                  <MenuItem key={index} value={programa.Programa}>
                    {programa.Programa}
                    {programa.Sede && programa.Sede !== "Cali" ? ` - ${programa.Sede}` : ""}
                  </MenuItem>
                ))}
                <MenuItem value="General">General</MenuItem>
              </Select>
              {errors?.nombre_dependencia && <FormHelperText>{errors.nombre_dependencia}</FormHelperText>}
            </FormControl>
            </Grid>
          )}
        </>
      )}

      {formData.dependencia_tipo === "Oficinas" && (
        <Grid item xs={12}>
          <FormControl fullWidth required error={!!errors?.nombre_dependencia}>
            <InputLabel id="oficina-label">Oficinas</InputLabel>
            <Select
              labelId="oficina-label"
              name="nombre_dependencia"
              value={formData.nombre_dependencia || ''}
              onChange={handleInputChange}
              label="Oficinas"
            >
              <MenuItem value="">-</MenuItem>
              {(oficinas || []).map((oficina, index) => (
                <MenuItem key={index} value={oficina}>
                  {oficina}
                </MenuItem>
              ))}
            </Select>
            {errors?.nombre_dependencia && <FormHelperText>{errors.nombre_dependencia}</FormHelperText>}
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}

Step1.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  escuelas: PropTypes.array,
  departamentos: PropTypes.array,
  secciones: PropTypes.array,
  programas: PropTypes.array,
  oficinas: PropTypes.array,
};

export default Step1;
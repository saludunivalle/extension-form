import PropTypes from "prop-types";
import { FormHelperText, Grid, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';

function Step1({ formData, handleInputChange, escuelas, departamentos, secciones, programas, oficinas, errors }) {
  
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
          error={!!errors.fecha_solicitud}
          helperText={errors.fecha_solicitud}
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
          error={!!errors.nombre_actividad}
          helperText={errors.nombre_actividad}
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
          error={!!errors.nombre_solicitante}
          helperText={errors.nombre_solicitante}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.dependencia_tipo} required>
          <FormLabel component="legend">Dependencia</FormLabel>
          <RadioGroup
            name="dependencia_tipo"
            value={formData.dependencia_tipo || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Escuelas" control={<Radio />} label="Escuelas" />
            <FormControlLabel value="Oficinas" control={<Radio />} label="Oficinas" />
          </RadioGroup>
          {errors.dependencia_tipo && <FormHelperText>{errors.dependencia_tipo}</FormHelperText>}
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
              error={!!errors.nombre_escuela}
              helperText={errors.nombre_escuela}
            >
              <MenuItem value="">-</MenuItem>
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
                error={!!errors.nombre_departamento}
                helperText={errors.nombre_departamento}
              >
                <MenuItem value="">-</MenuItem>
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
                error={!!errors.nombre_seccion}
                helperText={errors.nombre_seccion}
              >
                <MenuItem value="">-</MenuItem>
                {secciones.map((seccion, index) => (
                  <MenuItem key={index} value={seccion}>
                    {seccion}
                    {seccion.sede && seccion.sede !== "Cali" ? ` - ${seccion.sede}` : ""}
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
              error={!!errors.nombre_dependencia}
              helperText={errors.nombre_dependencia}
            >
              <MenuItem value="">-</MenuItem>
              {programas.map((programa, index) => (
                <MenuItem key={index} value={programa.Programa}>
                  {programa.Programa}
                  {programa.Sede && programa.Sede !== "Cali" ? ` - ${programa.Sede}` : ""}
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
            error={!!errors.nombre_dependencia}
            helperText={errors.nombre_dependencia}
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

Step1.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setErrors: PropTypes.func.isRequired,
  escuelas: PropTypes.array.isRequired,
  departamentos: PropTypes.array.isRequired,
  secciones: PropTypes.array.isRequired,
  programas: PropTypes.array.isRequired,
  oficinas: PropTypes.array.isRequired,
};

export default Step1;

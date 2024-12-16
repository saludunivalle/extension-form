import React from 'react';
import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, InputLabel, MenuItem, Box  } from '@mui/material';

function Step5({ formData, handleInputChange, handleFileChange, errors}) {

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormLabel component="legend" required>Becas o exenciones</FormLabel>
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
              placeholder="0"
              required
              error={!!errors.becas_convenio}
              helperText={errors.becas_convenio}
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
              //inputProps={{ min: "0" }} 
              required
              error={!!errors.becas_estudiantes}
              helperText={errors.becas_estudiantes}
              placeholder="0"
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
              //inputProps={{ min: "0" }}
              placeholder="0"
              required
              error={!!errors.becas_docentes}
              helperText={errors.becas_docentes}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Egresados"
              fullWidth
              name="becas_egresados"
              type="number"
              value={formData.becas_egresados}
              onChange={handleInputChange}
              //inputProps={{ min: "0" }} 
              placeholder="0"
              required
              error={!!errors.becas_egresados}
              helperText={errors.becas_egresados}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Funcionarios"
              fullWidth
              name="becas_funcionarios"
              type="number"
              value={formData.becas_funcionarios}
              onChange={handleInputChange}
              //inputProps={{ min: "0" }} 
              placeholder="0"
              required
              error={!!errors.becas_funcionarios}
              helperText={errors.becas_funcionarios}
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
              //inputProps={{ min: "0" }} 
              placeholder="0"
              required
              error={!!errors.becas_otros}
              helperText={errors.becas_otros}
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
                  parseInt(formData.becas_egresados || 0) +
                  parseInt(formData.becas_funcionarios || 0) +
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

      {/* Periodicidad de la Oferta */}
      <Grid item xs={12}>
        <FormControl component="fieldset" required>
          <FormLabel component="legend">Periodicidad de la oferta</FormLabel>
          <RadioGroup
            name="periodicidad_oferta"
            value={formData.periodicidad_oferta || ''}
            onChange={handleInputChange}
            required
            error={!!errors.periodicidad_oferta}
            helperText={errors.periodicidad_oferta}
          >
            <FormControlLabel value="anual" control={<Radio />} label="Anual" />
            <FormControlLabel value="semestral" control={<Radio />} label="Semestral" />
            <FormControlLabel value="permanente" control={<Radio />} label="Permanente" />
          </RadioGroup>
        </FormControl>
      </Grid>
              
      <Grid item xs={12}>
      <FormControl component="fieldset" required>
          <FormLabel component="legend">La organización de la actividad se hará por</FormLabel>
          <RadioGroup
            name="organizacion_actividad"
            value={formData.organizacion_actividad || ''}
            onChange={handleInputChange}
            required
            error={!!errors.organizacion_actividad}
            helperText={errors.organizacion_actividad}
          >
            <FormControlLabel value="ofi_ext" control={<Radio />} label="Oficina de Extensión" />
            <FormControlLabel value="unidad_acad" control={<Radio />} label="Unidad Académica" />
            <FormControlLabel value="otro_act" control={<Radio />} label="Otro" />
          </RadioGroup>
          {formData.organizacion_actividad === "otro_act" && (
            <Box sx={{ marginTop: 2 }}>
              <TextField
                label="¿Cuál?"
                fullWidth
                name="otro_tipo_act"
                value={formData.otro_tipo_act || ""}
                onChange={handleInputChange}
              />
            </Box>
          )}
        </FormControl>
      </Grid>
      {/* "Es extensión solidaria?" campo */}
      <Grid item xs={12}>
        <FormControl component="fieldset" required>
          <FormLabel component="legend">¿Es Extensión Solidaria?</FormLabel>
          <RadioGroup
            name="extension_solidaria"
            value={formData.extension_solidaria || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="si" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* Si es extensión solidaria, preguntar el costo del curso */}
      {formData.extension_solidaria === 'si' && (
        <Grid item xs={12}>
          <TextField
            label="Si se cobrase el curso, ¿cuánto costaría? ($$$)"
            fullWidth
            name="costo_extension_solidaria"
            type="number"
            value={formData.costo_extension_solidaria || ''}
            onChange={handleInputChange}
          />
        </Grid>
      )}

      {/* "Tiene pieza gráfica?" campo de subida de archivos */}
      <Grid item xs={12}>
        <FormLabel component="legend">¿Tiene Pieza Gráfica?</FormLabel>
        <input
          type="file"
          name="pieza_grafica"  // Atributo name agregado para identificar el campo en el backend
          accept=".png, .jpg, .jpeg, .pdf"
          onChange={handleFileChange}
        />
      </Grid>

      {/* "Personal Externo" campo */}
      <Grid item xs={12}>
        <TextField
          label="Personal Externo"
          fullWidth
          name="personal_externo"
          value={formData.personal_externo || ''}
          onChange={handleInputChange}
          placeholder="Detalles del personal externo (opcional)"
          required
          error={!!errors.personal_externo}
          helperText={errors.personal_externo}
        />
      </Grid>

    </Grid>
  );
}

export default Step5;

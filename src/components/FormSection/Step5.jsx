import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Box, FormHelperText  } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

function Step5({ formData, handleInputChange, handleFileChange, errors, setFormData}) {

  // useEffect para calcular automáticamente el total de becas
  useEffect(() => {
    const totalBecas = (
      parseInt(formData.becas_convenio || 0) +
      parseInt(formData.becas_estudiantes || 0) +
      parseInt(formData.becas_docentes || 0) +
      parseInt(formData.becas_egresados || 0) +
      parseInt(formData.becas_funcionarios || 0) +
      parseInt(formData.becas_otros || 0)
    );

    // Solo actualizar si el total es diferente al actual
    if (totalBecas !== parseInt(formData.becas_total || 0)) {
      setFormData(prev => ({
        ...prev,
        becas_total: totalBecas.toString()
      }));
    }

    // Debug: Log para becas_otros
    console.log("🔍 Debug becas_otros en Step5:", {
      valor: formData.becas_otros,
      tipo: typeof formData.becas_otros,
      totalCalculado: totalBecas
    });

  }, [formData.becas_convenio, formData.becas_estudiantes, formData.becas_docentes, 
      formData.becas_egresados, formData.becas_funcionarios, formData.becas_otros, setFormData]);

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
              value={formData.becas_convenio ?? "0"}
              onChange={handleInputChange}
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
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
              value={formData.becas_estudiantes ?? "0"}
              onChange={handleInputChange}
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
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
              value={formData.becas_docentes ?? "0"}
              onChange={handleInputChange }
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
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
              value={formData.becas_egresados ?? "0"}
              onChange={handleInputChange}
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
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
              value={formData.becas_funcionarios ?? "0"}
              onChange={handleInputChange}
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
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
              value={formData.becas_otros ?? "0"}
              onChange={handleInputChange}
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault(); // Bloquear signo negativo
                }
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Total Becas"
              fullWidth
              name="becas_total"
              value={formData.becas_total || "0"}
              InputProps={{
                readOnly: true,
              }}
              disabled={true}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#303030", // Texto en gris oscuro
                },
                "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a1a1a1", // Borde más oscuro
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#717171", // Label en gris oscuro
                },
              }}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Periodicidad de la Oferta */}
      <Grid item xs={12}>
        <FormControl component="fieldset" required error={!!errors.periodicidad_oferta}>
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
          {errors.periodicidad_oferta && (<FormHelperText>{errors.periodicidad_oferta}</FormHelperText>)}
        </FormControl>
      </Grid>
              
      <Grid item xs={12}>
      <FormControl component="fieldset" required error={!!errors.organizacion_actividad}>
          <FormLabel component="legend">La organización de la actividad se hará por</FormLabel>
          <RadioGroup
            name="organizacion_actividad"
            value={formData.organizacion_actividad || ''}
            onChange={(e) => {
              // Añadir un callback especial para este campo
              console.log(`📋 organizacion_actividad seleccionado: ${e.target.value}`);
              handleInputChange(e);
            }}
            required
          >
            <FormControlLabel value="ofi_ext" control={<Radio />} label="Oficina de Extensión" />
            <FormControlLabel value="unidad_acad" control={<Radio />} label="Unidad Académica" />
            <FormControlLabel value="otro_act" control={<Radio />} label="Otro" />
          </RadioGroup>
          {errors.organizacion_actividad && (<FormHelperText>{errors.organizacion_actividad}</FormHelperText>)}
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
        <FormControl component="fieldset" required error={!!errors.extension_solidaria}>
          <FormLabel component="legend">¿Es Extensión Solidaria?</FormLabel>
          <RadioGroup
            name="extension_solidaria"
            value={formData.extension_solidaria || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="si" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
          {errors.extension_solidaria && (<FormHelperText>{errors.extension_solidaria}</FormHelperText>)}
        </FormControl>
      </Grid>

      {/* Si es extensión solidaria, preguntar el costo del curso */}
      {formData.extension_solidaria === 'si' && (
        <Grid item xs={12}>
          <TextField
            label="Si la actividad fuese cobrada, ¿Cuánto costaría? ($$$)"
            fullWidth
            name="costo_extension_solidaria"
            type="text"
            value={
              formData.costo_extension_solidaria
                ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(formData.costo_extension_solidaria)
                : ''
            }
            onChange={(e) => {
              // Eliminar todos los caracteres no numéricos
              const rawValue = e.target.value.replace(/[^0-9]/g, '');
              let numericValue = rawValue === '' ? '' : parseInt(rawValue, 10);
              if (numericValue !== '' && numericValue < 1) numericValue = 1;
              handleInputChange({
                target: {
                  name: e.target.name,
                  value: numericValue
                }
              });
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            error={!!errors.costo_extension_solidaria}
            helperText={
              formData.costo_extension_solidaria === 0 || formData.costo_extension_solidaria === ''
                ? "El programa es sin costo"
                : `Valor unitario: $${new Intl.NumberFormat('es-CO').format(formData.costo_extension_solidaria)} COP`
            }
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
          label="Përsonal Externo Asignado"
          fullWidth
          name="personal_externo"
          value={formData.personal_externo || ''}
          onChange={handleInputChange}
          placeholder="Detalles del personal externo (opcional)"
        />
      </Grid>

    </Grid>
  );
}

Step5.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default Step5;

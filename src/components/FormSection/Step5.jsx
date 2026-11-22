import { Grid, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Box, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const SMMLV = 1750905;

const formatCop = (value) => {
  const numeric = Number(value || 0);
  if (!numeric) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

function Step5({ formData, handleInputChange, errors, setFormData }) {

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

    if (totalBecas !== parseInt(formData.becas_total || 0)) {
      setFormData(prev => ({
        ...prev,
        becas_total: totalBecas.toString()
      }));
    }
  }, [formData.becas_convenio, formData.becas_estudiantes, formData.becas_docentes, 
      formData.becas_egresados, formData.becas_funcionarios, formData.becas_otros, formData.becas_total, setFormData]);

  // Sincronización automática entre SMMLV y COP
  useEffect(() => {
    if (formData.extension_solidaria === 'si') {
      if (formData.tipo_valor !== 'cifra_pesos' || formData.valor_inscripcion !== 0 || formData.valor_unitario !== 0) {
        setFormData(prev => ({
          ...prev,
          tipo_valor: 'cifra_pesos',
          valor_inscripcion: 0,
          valor_unitario: 0
        }));
      }
      return;
    }

    if (formData.tipo_valor === 'valor_unitario') {
      const unitValue = Number(formData.valor_unitario || 0);
      const calculatedPesos = Math.round(unitValue * SMMLV);
      const currentPesos = Number(formData.valor_inscripcion || 0);

      if (!Number.isNaN(unitValue) && calculatedPesos !== currentPesos) {
        handleInputChange({
          target: {
            name: 'valor_inscripcion',
            value: calculatedPesos,
          },
        });
      }
    }

    if (formData.tipo_valor === 'cifra_pesos') {
      const pesos = Number(formData.valor_inscripcion || 0);
      const calculatedUnitValue = pesos === 0 ? 0 : parseFloat((pesos / SMMLV).toFixed(4));
      const currentUnitValue = Number(formData.valor_unitario || 0);

      if (!Number.isNaN(pesos) && calculatedUnitValue !== currentUnitValue) {
        handleInputChange({
          target: {
            name: 'valor_unitario',
            value: calculatedUnitValue,
          },
        });
      }
    }
  }, [formData.extension_solidaria, formData.tipo_valor, formData.valor_unitario, formData.valor_inscripcion, handleInputChange, setFormData]);

  const handleExtensionSolidariaChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);

    if (value === 'si') {
      // Si es solidaria: se autoselecciona cifra en pesos y valor 0
      setFormData(prev => ({
        ...prev,
        extension_solidaria: 'si',
        tipo_valor: 'cifra_pesos',
        valor_inscripcion: 0,
        valor_unitario: 0
      }));
    } else if (value === 'no') {
      // Si no es solidaria: se activa para que el usuario escoja el tipo de valor
      setFormData(prev => ({
        ...prev,
        extension_solidaria: 'no',
        tipo_valor: prev.tipo_valor === 'cifra_pesos' && (prev.valor_inscripcion === 0 || prev.valor_inscripcion === '0') ? '' : prev.tipo_valor,
        valor_inscripcion: prev.valor_inscripcion === 0 || prev.valor_inscripcion === '0' ? '' : prev.valor_inscripcion,
        valor_unitario: prev.valor_unitario === 0 || prev.valor_unitario === '0' ? '' : prev.valor_unitario
      }));
    }
  };

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
                  if (e.key === '-') e.preventDefault();
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
                  if (e.key === '-') e.preventDefault();
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
              onChange={handleInputChange}
              placeholder="0"
              inputProps={{ 
                min: "0",
                onKeyPress: (e) => {
                  if (e.key === '-') e.preventDefault();
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
                  if (e.key === '-') e.preventDefault();
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
                  if (e.key === '-') e.preventDefault();
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
                  if (e.key === '-') e.preventDefault();
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
                  WebkitTextFillColor: "#303030",
                },
                "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a1a1a1",
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#717171",
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
            <FormControlLabel value='solo una vez' control={<Radio />} label='Solo una vez' />
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
            onChange={handleInputChange}
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

      {/* ¿Es Extensión Solidaria? */}
      <Grid item xs={12}>
        <FormControl component="fieldset" required error={!!errors.extension_solidaria}>
          <FormLabel component="legend">¿Es Extension Solidaria?</FormLabel>
          <RadioGroup
            name="extension_solidaria"
            value={formData.extension_solidaria || ''}
            onChange={handleExtensionSolidariaChange}
          >
            <FormControlLabel value="si" control={<Radio />} label="Si" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
          {errors.extension_solidaria && (<FormHelperText>{errors.extension_solidaria}</FormHelperText>)}
        </FormControl>
      </Grid>

      {formData.extension_solidaria === 'si' && (
        <Grid item xs={12}>
          <TextField
            label="Si se cobrase el curso, ¿cuánto costaría? (COP)"
            fullWidth
            name="costo_extension_solidaria"
            type="text"
            value={formData.costo_extension_solidaria ?? ''}
            onFocus={(e) => {
              if (formData.costo_extension_solidaria === 0 || formData.costo_extension_solidaria === '0') {
                e.target.select();
              }
            }}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/[^0-9]/g, '');
              const numericValue = rawValue === '' ? '' : parseInt(rawValue, 10);
              handleInputChange({
                target: {
                  name: e.target.name,
                  value: numericValue,
                },
              });
            }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            placeholder="0"
            error={!!errors.costo_extension_solidaria}
            helperText={
              errors.costo_extension_solidaria ||
              (formData.costo_extension_solidaria === 0 || formData.costo_extension_solidaria === '0'
                ? 'El programa es sin costo ($0 COP)'
                : formData.costo_extension_solidaria
                ? `Valor estimado: $${new Intl.NumberFormat('es-CO').format(Number(formData.costo_extension_solidaria))} COP`
                : 'Ingrese el valor estimado si se cobrase el curso')
            }
          />
        </Grid>
      )}

      {/* Si NO es extensión solidaria: se activa la selección de tipo de valor y el campo correspondiente */}
      {formData.extension_solidaria === 'no' && (
        <>
          <Grid item xs={12}>
            <FormControl component="fieldset" required error={!!errors.tipo_valor}>
              <FormLabel component="legend">Tipo de valor a registrar</FormLabel>
              <RadioGroup
                row
                name="tipo_valor"
                value={formData.tipo_valor || ''}
                onChange={handleInputChange}
              >
                <FormControlLabel value="valor_unitario" control={<Radio />} label="Valor unitario (SMMLV)" />
                <FormControlLabel value="cifra_pesos" control={<Radio />} label="Cifra en pesos (COP)" />
              </RadioGroup>
              {errors.tipo_valor && <FormHelperText>{errors.tipo_valor}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Se muestra SOLO si el usuario seleccionó "valor_unitario" */}
          {formData.tipo_valor === 'valor_unitario' && (
            <Grid item xs={12}>
              <TextField
                label="Valor unitario (SMMLV) *"
                fullWidth
                name="valor_unitario"
                value={formData.valor_unitario ?? ''}
                onChange={(e) => {
                  const rawValue = String(e.target.value || '').trim();

                  if (rawValue === '') {
                    handleInputChange({ target: { name: 'valor_unitario', value: '' } });
                    handleInputChange({ target: { name: 'valor_inscripcion', value: 0 } });
                    return;
                  }

                  if (!/^\d{0,2}([.,]\d{0,2})?$/.test(rawValue)) {
                    return;
                  }

                  const unitValue = parseFloat(rawValue.replace(',', '.'));
                  if (Number.isNaN(unitValue)) return;

                  handleInputChange({ target: { name: 'valor_unitario', value: unitValue } });
                  handleInputChange({ target: { name: 'valor_inscripcion', value: Math.round(unitValue * SMMLV) } });
                }}
                placeholder="Ej: 10,5"
                error={!!errors.valor_unitario}
                helperText={
                  errors.valor_unitario ||
                  `SMMLV vigente: ${new Intl.NumberFormat('es-CO').format(SMMLV)} COP${
                    formData.valor_inscripcion ? ` (Equivale a: ${formatCop(formData.valor_inscripcion)})` : ''
                  }`
                }
              />
            </Grid>
          )}

          {/* Se muestra SOLO si el usuario seleccionó "cifra_pesos" */}
          {formData.tipo_valor === 'cifra_pesos' && (
            <Grid item xs={12}>
              <TextField
                label="Valor de inscripción (COP) *"
                fullWidth
                name="valor_inscripcion"
                value={formatCop(formData.valor_inscripcion)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
                  const calculatedUnitValue = numericValue === 0 ? 0 : parseFloat((numericValue / SMMLV).toFixed(4));

                  handleInputChange({
                    target: {
                      name: e.target.name,
                      value: numericValue
                    }
                  });

                  handleInputChange({
                    target: {
                      name: 'valor_unitario',
                      value: calculatedUnitValue,
                    },
                  });
                }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*"
                }}
                placeholder="0"
                error={!!errors.valor_inscripcion}
                helperText={
                  errors.valor_inscripcion ||
                  (formData.valor_inscripcion === 0
                    ? "El programa es sin costo"
                    : `Equivale a ${Number(formData.valor_unitario || 0).toFixed(4)} SMMLV`)
                }
              />
            </Grid>
          )}
        </>
      )}

      <Grid item xs={12}>
        <TextField
          label="Link pieza grafica"
          fullWidth
          name="pieza_grafica"
          value={formData.pieza_grafica || ''}
          onChange={handleInputChange}
          placeholder="https://..."
          helperText="Ingrese la URL de la pieza grafica"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Personal Externo Asignado"
          fullWidth
          multiline
          rows={3}
          name="personal_externo"
          value={formData.personal_externo || ''}
          onChange={handleInputChange}
          placeholder="Detalles del personal externo (opcional)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Observaciones y/o Cambios"
          fullWidth
          multiline
          rows={4}
          name="observaciones_cambios"
          value={formData.observaciones_cambios || ''}
          onChange={handleInputChange}
          placeholder="Observaciones y/o Cambios"
          helperText='En caso de modificación, se debe incluir la descripción detallada del ajuste y en caso de actualización, se deberá indicar que elementos son objeto de actualización'
        />
      </Grid>

    </Grid>
  );
}

Step5.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default Step5;

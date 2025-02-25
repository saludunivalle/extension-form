import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField, Typography, Box, FormHelperText  } from '@mui/material';
import PropTypes from 'prop-types';

function Step3({ formData, setFormData, errors  }) {

  const handleCustomInputChange = (event) => {
    const { name, value } = event.target;
  
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
  
      // Recalcular total_horas solo si es necesario
      if (name === "horas_trabajo_presencial" || name === "horas_sincronicas" || name === "modalidad") {
        let total = 0;
  
        if (updatedData.modalidad === "Presencial") {
          total = parseInt(updatedData.horas_trabajo_presencial) || 0;
        } else if (updatedData.modalidad === "Virtual") {
          total = parseInt(updatedData.horas_sincronicas) || 0;
        } else if (["Semipresencial", "Mixta", "Todas"].includes(updatedData.modalidad)) {
          total =
            (parseInt(updatedData.horas_trabajo_presencial) || 0) +
            (parseInt(updatedData.horas_sincronicas) || 0);
        }
  
        updatedData.total_horas = total > 0 ? total : 1;  
      }
  
      return updatedData;
    });
  };

  return (
    <Grid container spacing={2}>
            <Grid item xs={12}>
          <FormControl component="fieldset" error={!!errors.tipo} required>
          <FormLabel component="legend">Tipo</FormLabel>
          <RadioGroup
            row
            name="tipo"
            value={formData.tipo || ''}
            onChange={handleCustomInputChange}
          >
            <FormControlLabel value="Curso" control={<Radio />} label="Curso" />
            <FormControlLabel value="Congreso" control={<Radio />} label="Congreso" />
            <FormControlLabel value="Conferencia" control={<Radio />} label="Conferencia" />
            <FormControlLabel value="Simposio" control={<Radio />} label="Simposio" />
            <FormControlLabel value="Diplomado" control={<Radio />} label="Diplomado" />
            <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
          </RadioGroup>
          {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
          {formData.tipo === "Otro" && (
            <Box sx={{ marginTop: 2 }}>
              <TextField
                label="¿Cuál?"
                fullWidth
                name="otro_tipo"
                value={formData.otro_tipo || ""}
                onChange={handleCustomInputChange}
              />
            </Box>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.modalidad} required>
          <FormLabel component="legend">Modalidad</FormLabel>
          <RadioGroup
            row
            name="modalidad"
            value={formData.modalidad || ''}
            onChange={handleCustomInputChange}
          >
            <FormControlLabel value="Presencial" control={<Radio />} label="Presencial" />
            <FormControlLabel value="Semipresencial" control={<Radio />} label="Semipresencial" />
            <FormControlLabel value="Virtual" control={<Radio />} label="Virtual" />
            <FormControlLabel value="Mixta" control={<Radio />} label="Mixta" />
            <FormControlLabel value="Todas" control={<Radio />} label="Todas las anteriores" />
          </RadioGroup>
          {errors.modalidad && <FormHelperText>{errors.modalidad}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Intensidad Horaria</Typography>
      </Grid>

      {(formData.modalidad === "Presencial" || formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") && (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {(formData.modalidad === "Presencial" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") && (
              <Grid item xs={4}>
                <TextField
                  label="Horas de trabajo Presencial"
                  fullWidth
                  name="horas_trabajo_presencial"
                  value={formData.horas_trabajo_presencial}
                  onChange={handleCustomInputChange}
                  error={!!errors.horas_trabajo_presencial}
                  helperText={errors.horas_trabajo_presencial}
                  type="number"
                  inputProps={{ 
                    min: 1, // Valor mínimo permitido
                    onKeyPress: (e) => {
                      if (e.key === '-') e.preventDefault(); // Bloquear caracteres no deseados
                    }
                  }}
                />
              </Grid>
            )}

            {(formData.modalidad === "Virtual" || formData.modalidad === "Mixta" || formData.modalidad === "Semipresencial" || formData.modalidad === "Todas") && (
              <Grid item xs={4}>
                <TextField
                  label="Horas Sincrónicas"
                  fullWidth
                  name="horas_sincronicas"
                  value={formData.horas_sincronicas}
                  onChange={handleCustomInputChange}
                  error={!!errors.horas_sincronicas}
                  helperText={errors.horas_sincronicas}
                  type="number"
                  inputProps={{ 
                    min: 1, // Valor mínimo permitido
                    onKeyPress: (e) => {
                      if (e.key === '-') e.preventDefault(); // Bloquear caracteres no deseados
                    }
                  }}
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
                disabled={true}
              />
            </Grid>
          </Grid>
        </Grid>
      )}

     <Grid item xs={12}>
        <Grid container spacing={2}>
                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Programa y contenidos"
                    fullWidth
                    name="programCont"
                    value={formData.programCont}
                    onChange={handleCustomInputChange}
                    required
                    error={!!errors.programCont}
                    helperText={errors.programCont}
                    />
                </Grid>

                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Dirigido a"
                    fullWidth
                    name="dirigidoa"
                    value={formData.dirigidoa}
                    onChange={handleCustomInputChange}
                    required
                    error={!!errors.dirigidoa}
                    helperText={errors.dirigidoa}
                    />
                </Grid>

                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Créditos"
                    fullWidth
                    name="creditos"
                    value={formData.creditos}
                    type="number" 
                    inputProps={{
                      min: 1,
                      max: 50,
                      onKeyPress: (e) => {
                        if (e.key === '-') e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Limitar máximo a 50
                      if (value > 50) value = 50;
                      // Convertir a número y validar
                      const numericValue = Math.max(1, Math.min(50, parseInt(value)));
                      handleCustomInputChange({
                        target: {
                          name: "creditos",
                          value: numericValue
                        }
                      });
                    }} 
                    required
                    error={!!errors.creditos}
                    helperText={errors.creditos || "Máximo 50 créditos"}
                    
                    />
                </Grid>
        </Grid>
     </Grid>


      <Grid item xs={6} sm={6}>
        <TextField
          label="Cupo Mínimo"
          fullWidth
          name="cupo_min"
          value={formData.cupo_min}
          required
          error={!!errors.cupo_min}
          helperText={errors.cupo_min}
          type="number" 
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              handleCustomInputChange(e);
            }
          }}
        />
      </Grid>

      <Grid item xs={6} sm={6}>
        <TextField
          label="Cupo Máximo"
          fullWidth
          name="cupo_max"
          value={formData.cupo_max}
          type="number" 
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              handleCustomInputChange(e);
            }
          }}          helperText="Este valor no incluye las becas"
          required
          error={!!errors.cupo_max}
        />
      </Grid>
    </Grid>
  );
}

Step3.propTypes = {
  formData: PropTypes.shape({
    tipo: PropTypes.string,
    otro_tipo: PropTypes.string,
    modalidad: PropTypes.string,
    horas_trabajo_presencial: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    horas_sincronicas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_horas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    programCont: PropTypes.string,
    dirigidoa: PropTypes.string,
    creditos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cupo_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cupo_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default Step3;

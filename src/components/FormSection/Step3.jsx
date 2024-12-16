import React from 'react';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField, Typography  } from '@mui/material';

function Step3({ formData, handleInputChange  }) {
  return (
    <Grid container spacing={2}>
            <Grid item xs={12}>
          <FormControl component="fieldset" required>
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
        <FormControl component="fieldset" required>
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
            <FormControlLabel value="Todas" control={<Radio />} label="Todas las anteriores" />
          </RadioGroup>
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
                  onChange={handleInputChange}
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
        <Grid container spacing={2}>
                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Programa y contenidos"
                    fullWidth
                    name="programCont"
                    value={formData.programCont}
                    onChange={handleInputChange}
                    required
                    />
                </Grid>

                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Dirigido a"
                    fullWidth
                    name="dirigidoa"
                    value={formData.dirigidoa}
                    onChange={handleInputChange}
                    required
                    />
                </Grid>

                <Grid item xs={4} sm={4}>
                    <TextField
                    label="Créditos"
                    fullWidth
                    name="creditos"
                    value={formData.creditos}
                    onChange={handleInputChange}
                    required
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
          onChange={handleInputChange}
          required
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
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step3;

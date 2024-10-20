import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

function Step3({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
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

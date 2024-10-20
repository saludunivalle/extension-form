import React from 'react';
import { Grid, TextField, Box, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';

function Step2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl component="fieldset">
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
        <FormControl component="fieldset">
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

      {/* <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Tipo de Oferta</FormLabel>
          <RadioGroup
            row
            name="tipo_oferta"
            value={formData.tipo_oferta || ''}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Oferta Abierta" control={<Radio />} label="Oferta Abierta" />
            <FormControlLabel value="Oferta Cerrada" control={<Radio />} label="Oferta Cerrada" />
          </RadioGroup>
        </FormControl>
      </Grid> */}
{/* 
      <Grid item xs={12}>
        <TextField
          label="Ofrecido por"
          fullWidth
          name="ofrecido_por"
          value={formData.ofrecido_por || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Unidad Académica"
          fullWidth
          name="unidad_academica"
          value={formData.nombre_dependencia || ''}
          InputProps={{
            readOnly: true,
          }}
          required
        />
      </Grid> */}
      {/* <Grid item xs={12}>
        <TextField
          label="Ofrecido para"
          fullWidth
          multiline
          rows={4}
          name="ofrecido_para"
          value={formData.ofrecido_para}
          onChange={handleInputChange}
          required
        />
      </Grid> */}
    </Grid>
  );
}

export default Step2;

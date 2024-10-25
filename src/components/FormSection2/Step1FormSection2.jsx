import React from 'react';
import { Grid, TextField, Tooltip } from '@mui/material';

function Step1FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Sección inicial cuyo propósito principal es contextualizar el texto y normalmente se describe el alcance del documento, y se da una breve explicación o resumen del mismo. También se puede explicar algunos antecedentes que son importantes para el posterior desarrollo del tema central.</span>}>
          <TextField
            label="Introducción"
            fullWidth
            multiline
            rows={4}
            name="introduccion"
            value={formData.introduccion || ''}
            onChange={handleInputChange}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Es la base, lo que sustenta el proyecto, permiten tener una visión concreta y clara de lo que se hará a largo plazo el objetivo general es único, y los pasos que se seguirán para conseguir dicho propósito.</span>}>
          <TextField
            label="Objetivo General"
            fullWidth
            multiline
            rows={4}
            name="objetivo_general"
            value={formData.objetivo_general || ''}
            onChange={handleInputChange}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={<span style={{ fontSize: '15px' }}>Son enunciados proposicionales desagregados, desentrañados de un objetivo general, que sin excederlo, lo especifican, a nivel cualitativo y cuantitativo.</span>}>
          <TextField
            label="Objetivos Específicos"
            fullWidth
            multiline
            rows={4}
            name="objetivos_especificos"
            value={formData.objetivos_especificos || ''}
            onChange={handleInputChange}
            required
          />
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default Step1FormSection2;

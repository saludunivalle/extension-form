import React from 'react';
import { Grid, TextField, Tooltip} from '@mui/material';

function Step5FormSection2({ formData, handleInputChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
      <Tooltip title="Tipo de documento que se expida con el fin de validar la actividad, y dejar un registro del cumplimiento de la misma.">
        <TextField
          label="Certificación"
          fullWidth
          name="certificacion"
          value={formData.certificacion || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
      <Tooltip title="Personal: Personas que dictaran o estarán a cargo de la actividad, responsables del óptimo funcionamiento de este. Físicos: Infraestructura y toda clase de equipo que estén disponibles para el correcto funcionamiento del curso o la actividad.">
        <TextField
          label="Recursos (Personal, Físicos, Tecnológicos y de Apoyo)"
          fullWidth
          multiline
          rows={4}
          name="recursos"
          value={formData.recursos || ''}
          onChange={handleInputChange}
          required
        />
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default Step5FormSection2;

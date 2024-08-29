import React, { useState } from 'react';
import { Grid, TextField, Typography, Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import FormSection3 from '../components/FormSection3'; // Asegúrate de importar FormSection3

function FormSection2({ formData, handleInputChange, setCurrentSection }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Introducción y Objetivos',
    'Justificación y Descripción',
    'Metodología y Público Objetivo',
    'Contenido y Duración',
    'Certificación y Recursos',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNumberInputChange = (event) => {
    const { name, value } = event.target;
    if (/^\d*$/.test(value)) {
      handleInputChange(event);
    }
  };

  const handleSubmit = () => {
    // Aquí podrías manejar la lógica de envío si es necesario
    setCurrentSection(3); // Cambia a FormSection3
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Formulario de Solicitud Parte 2
      </Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <TextField
              label="Justificación"
              fullWidth
              multiline
              rows={4}
              name="justificacion"
              value={formData.justificacion || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <TextField
              label="Alcance"
              fullWidth
              multiline
              rows={4}
              name="alcance"
              value={formData.alcance || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Metodología"
              fullWidth
              multiline
              rows={4}
              name="metodologia"
              value={formData.metodologia || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirigido a"
              fullWidth
              multiline
              rows={2}
              name="dirigido_a"
              value={formData.dirigido_a || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <TextField
              label="Programa y Contenidos"
              fullWidth
              multiline
              rows={4}
              name="programa_contenidos"
              value={formData.programa_contenidos || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Duración"
              fullWidth
              name="duracion"
              value={formData.duracion || ''}
              onChange={handleNumberInputChange} // Solo permite números
              required
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 4 && (
        <Grid container spacing={2} sx={{ padding: { xs: '0.5rem 0', sm: '1rem 0' } }}>
          <Grid item xs={12}>
            <TextField
              label="Certificación"
              fullWidth
              name="certificacion"
              value={formData.certificacion || ''}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>
    </Box>
  );
}

export default FormSection2;

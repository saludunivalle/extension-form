import { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Box, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check'; // Icono para los pasos completados

// Componente personalizado para el ícono del paso
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: ownerState.completed
    ? '#0056b3' // Fondo azul para los pasos completados
    : ownerState.active
    ? '#0056b3' // Fondo azul para el paso activo
    : '#E0E0E0', // Fondo gris si no está activo ni completado
  color: ownerState.completed || ownerState.active
    ? '#ffffff' // Letra blanca si es activo o completado
    : '#4F4F4F', // Letra gris oscuro si no está activo ni completado
  fontSize: 18,
}));

// Componente personalizado para el ícono de cada paso
const CustomStepIcon = ({ active, completed, index }) => (
  <CustomStepIconRoot ownerState={{ active, completed }}>
    {completed ? <CheckIcon /> : index + 1}
  </CustomStepIconRoot>
);

const FormStepper = ({ activeStep, steps, setCurrentSection, completedSteps = [] }) => {
  const [highestStepReached, setHighestStepReached] = useState(activeStep); // Mantener el paso más alto alcanzado
  const isSmallScreen = useMediaQuery('(max-width:600px)'); // Responsividad para pantallas pequeñas

  // Actualizar el paso más alto alcanzado
  useEffect(() => {
    setHighestStepReached((prev) => Math.max(prev, activeStep));
  }, [activeStep]);

  // Manejar clics en los pasos
  const handleStepClick = (index) => {
    if (index <= highestStepReached) {
      // Permitir navegación solo hasta el paso más alto alcanzado
      setCurrentSection(index + 1); // Cambiar a la sección correspondiente (basado en índice + 1)
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: isSmallScreen ? '20px' : '0',
        paddingRight: '20px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Stepper
        activeStep={activeStep} // Paso actual
        orientation="horizontal"
        sx={{
          '& .MuiStepLabel-label': {
            color: '#4F4F4F', // Color gris por defecto
            fontWeight: 'normal',
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#FFFFFF', // Color blanco para el paso activo
            fontWeight: 'bold',
            backgroundColor: '#0056b3', // Fondo azul para el paso activo
            borderRadius: '10px',
            padding: '5px 10px',
          },
          '& .MuiStep-root': {
            cursor: 'pointer', // Hacer los pasos interactivos
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={index} onClick={() => handleStepClick(index)}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon
                  {...props}
                  index={index}
                  active={index === activeStep} // Marcar activo el paso actual
                  completed={completedSteps.includes(index) || index <= highestStepReached} // Completado si está en la lista o alcanzado
                />
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default FormStepper;

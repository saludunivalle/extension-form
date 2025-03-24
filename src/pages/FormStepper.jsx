import { Stepper, Step, StepLabel, useMediaQuery } from '@mui/material';
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
    ? '#0056b3' // Completado: azul oscuro
    : ownerState.active
    ? '#0056b3' // Activo: azul oscuro
    : ownerState.accessible
    ? '#78a9df' // Accesible pero no activo: azul claro
    : '#E0E0E0', // No accesible: gris
  color: ownerState.completed || ownerState.active || ownerState.accessible
    ? '#ffffff' // Blanco para pasos completados, activos o accesibles
    : '#4F4F4F', // Gris para pasos inaccesibles
  fontSize: 18,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: ownerState.accessible ? 'scale(1.05)' : 'none',
    boxShadow: ownerState.accessible ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
  }
}));

// Componente personalizado para el ícono de cada paso
const CustomStepIcon = ({ active, completed, index, isAccessible }) => (
  <CustomStepIconRoot ownerState={{ active, completed, accessible: isAccessible }}>
    {completed ? <CheckIcon /> : index + 1}
  </CustomStepIconRoot>
);

const FormStepper = ({ activeStep, steps, setCurrentSection, completedSteps = [], highestStepReached }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');


  // Manejar clics en los pasos
  const handleStepClick = (index) => {
    if (index <= highestStepReached) {
      setCurrentSection(index + 1);
    }
  };

  return (
    <Stepper 
      activeStep={activeStep} 
      alternativeLabel={isSmallScreen}
      sx={{
        // Estilos para el contenedor del stepper
        marginBottom: '20px',
        '& .MuiStepLabel-root': {
          cursor: 'default',
        },
      }}
    >
        {steps.map((label, index) => {
        const isAccessible = index <= highestStepReached;
        
        return (
          <Step key={label}>
            <StepLabel 
              StepIconComponent={(props) => (
                <CustomStepIcon 
                  {...props} 
                  index={index}
                  isAccessible={isAccessible}
                />
              )}
              onClick={() => handleStepClick(index)}
              sx={{
                cursor: isAccessible ? 'pointer !important' : 'default !important',
                '&:hover': {
                  opacity: isAccessible ? 0.8 : 1,
                },
                // Estilos para la etiqueta
                '& .MuiStepLabel-label': {
                  color: index === activeStep 
                    ? '#0056b3'
                    : isAccessible
                    ? '#4F4F4F'
                    : '#A0A0A0',
                  fontWeight: index === activeStep ? 'bold' : 'normal',
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default FormStepper;

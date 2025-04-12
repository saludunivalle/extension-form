import { Stepper, Step, StepLabel, useMediaQuery, Box } from '@mui/material';

import { styled } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check';
import PropTypes from 'prop-types';
import axios from 'axios';

// Componente personalizado para el ícono del paso con mejoras visuales
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: 
    ownerState.active
    ? '#0056b3' // Activo: azul oscuro (donde estoy parado)
    : ownerState.completed
    ? '#81bef7' // Completado no activo: azul medio (completado pero no estoy parado ahí)
    : ownerState.accessible
    ? '#81bef7' // Accesible pero no completado: azul más claro
    : '#E0E0E0', // No accesible: gris
  color: ownerState.completed || ownerState.active || ownerState.accessible
    ? '#ffffff' // Blanco para pasos completados, activos o accesibles
    : '#4F4F4F', // Gris para pasos inaccesibles
  fontSize: 18,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: ownerState.accessible || ownerState.completed ? 'scale(1.05)' : 'none',
    boxShadow: ownerState.accessible || ownerState.completed ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
  }
}));

// Componente personalizado para el ícono de cada paso
const CustomStepIcon = ({ active, completed, index, isAccessible }) => (
  <CustomStepIconRoot ownerState={{ active, completed, accessible: isAccessible }}>
    {completed ? <CheckIcon /> : index + 1}
  </CustomStepIconRoot>
);


CustomStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  index: PropTypes.number,
  isAccessible: PropTypes.bool
};

/**
 * Componente FormStepper mejorado con feedback visual y navegación condicional
 * @param {number} activeStep - Paso actualmente seleccionado (0-indexed)
 * @param {string[]} steps - Array con los nombres de cada paso
 * @param {Function} setCurrentSection - Función para cambiar la sección actual
 * @param {number[]} completedSteps - Array con los índices de los pasos completados
 * @param {number} highestStepReached - El índice del paso más alto permitido
 * @param {number[]} clickableSteps - Array con los índices de los pasos en los que se puede hacer clic
 */
const FormStepper = ({ 
  activeStep, 
  steps, 
  setCurrentSection, 
  completedSteps = [], 
  highestStepReached,
  clickableSteps = []
}) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Determinar si un paso es accesible basado en highestStepReached o clickableSteps
  const isStepAccessible = (index) => {
    if (clickableSteps.length > 0) {
      return clickableSteps.includes(index);
    }
    return index <= highestStepReached;
  };

  // Actualizar handleStepClick
  const handleStepClick = async (index) => {
    const newSection = index + 1; // +1 porque las secciones empiezan en 1
    
    try {
      // Validar navegación con el nuevo endpoint
      const response = await axios.post('https://siac-extension-server.vercel.app/progreso-actual', {
        id_solicitud: localStorage.getItem('id_solicitud'),
        etapa_destino: newSection,
        paso_destino: 1
      });
      
      if (response.data.success && response.data.puedeAvanzar) {
        setCurrentSection(newSection);
      } else {
        // Mostrar mensaje informativo
        alert(response.data.mensaje || 'No puede avanzar a esta sección en este momento.');
      }
    } catch (error) {
      console.error('Error al validar navegación:', error);
      alert('Hubo un problema al verificar si puede avanzar. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <Box sx={{ width: '100%', marginBottom: '20px' }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={isSmallScreen}
        sx={{
          '& .MuiStepLabel-root': {
            cursor: 'default',
          }
        }}
      >
        {steps.map((label, index) => {
          const isAccessible = isStepAccessible(index);
          
          return (
            <Step key={label}>
              <StepLabel 
                StepIconComponent={(props) => (
                  <CustomStepIcon 
                    {...props} 
                    index={index}
                    isAccessible={isAccessible}
                    completed={completedSteps.includes(index)}
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
                      ? '#0056b3' // Activo: azul oscuro
                      : completedSteps.includes(index)
                      ? '#81bef7' // Completado no activo: azul medio
                      : isAccessible
                      ? '#81bef7' // Accesible no completado: azul claro
                      : '#A0A0A0', // No accesible: gris
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
    </Box>

  );
};


FormStepper.propTypes = {
  activeStep: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCurrentSection: PropTypes.func.isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.number),
  highestStepReached: PropTypes.number,
  clickableSteps: PropTypes.arrayOf(PropTypes.number)
};

export default FormStepper;
import React, { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, CircularProgress} from '@mui/material';
import Step1FormSection3 from './Step1FormSection3';
import Step2FormSection3 from './Step2FormSection3';
import Step3FormSection3 from './Step3FormSection3';
import axios from 'axios'; 
import { useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

function FormSection3({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep }) {
  
  const [activeStep, setActiveStep] = useState(currentStep);  // Inicializar con el paso actual
  const id_usuario = userData?.id_usuario;
  const location = useLocation();
  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); 
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
  const [showModal, setShowModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Resumen Financiero'];

  // Verificar que estamos recibiendo el `formData` y el `userData`
  useEffect(() => {
    console.log('Formulario data recibido: ', formData);
    console.log('Datos del usuario: ', userData);
  }, [formData, userData]);

  // Manejo del paso "Siguiente"
  const handleNext = async () => {
    setIsLoading(true); // Iniciar el loading
    const hoja = 2; // Formulario 3 va en SOLICITUDES3
    console.log("Datos del formulario antes de enviar:", formData); 
    
    let pasoData = {};

    switch (activeStep) {
        case 0:
            pasoData = {
                nombre_actividad: formData.nombre_actividad || '',
                fecha_solicitud: formData.fecha_solicitud || '',
            };
            break;
        case 1:
            // Ingresos y Gastos (Paso 2)
            pasoData = {
                // Ingresos
                ingresos_cantidad: formData.ingresos_cantidad || '',
                ingresos_vr_unit: formData.ingresos_vr_unit || '',
                total_ingresos: (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0),
              
                // Gastos
                costos_personal_cantidad: formData.costos_personal_cantidad || '',
                costos_personal_vr_unit: formData.costos_personal_vr_unit || '',
                total_costos_personal: (formData.costos_personal_cantidad || 0) * (formData.costos_personal_vr_unit || 0),
              
                personal_universidad_cantidad: formData.personal_universidad_cantidad || '',
                personal_universidad_vr_unit: formData.personal_universidad_vr_unit || '',
                total_personal_universidad: (formData.personal_universidad_cantidad || 0) * (formData.personal_universidad_vr_unit || 0),
              
                honorarios_docentes_cantidad: formData.honorarios_docentes_cantidad || '',
                honorarios_docentes_vr_unit: formData.honorarios_docentes_vr_unit || '',
                total_honorarios_docentes: (formData.honorarios_docentes_cantidad || 0) * (formData.honorarios_docentes_vr_unit || 0),
              
                otro_personal_cantidad: formData.otro_personal_cantidad || '',
                otro_personal_vr_unit: formData.otro_personal_vr_unit || '',
                total_otro_personal: (formData.otro_personal_cantidad || 0) * (formData.otro_personal_vr_unit || 0),
              
                materiales_sumi_cantidad: formData.materiales_sumi_cantidad || '',
                materiales_sumi_vr_unit: formData.materiales_sumi_vr_unit || '',
                total_materiales_sumi: (formData.materiales_sumi_cantidad || 0) * (formData.materiales_sumi_vr_unit || 0),
              
                gastos_alojamiento_cantidad: formData.gastos_alojamiento_cantidad || '',
                gastos_alojamiento_vr_unit: formData.gastos_alojamiento_vr_unit || '',
                total_gastos_alojamiento: (formData.gastos_alojamiento_cantidad || 0) * (formData.gastos_alojamiento_vr_unit || 0),
              
                gastos_alimentacion_cantidad: formData.gastos_alimentacion_cantidad || '',
                gastos_alimentacion_vr_unit: formData.gastos_alimentacion_vr_unit || '',
                total_gastos_alimentacion: (formData.gastos_alimentacion_cantidad || 0) * (formData.gastos_alimentacion_vr_unit || 0),
              
                gastos_transporte_cantidad: formData.gastos_transporte_cantidad || '',
                gastos_transporte_vr_unit: formData.gastos_transporte_vr_unit || '',
                total_gastos_transporte: (formData.gastos_transporte_cantidad || 0) * (formData.gastos_transporte_vr_unit || 0),
              
                equipos_alquiler_compra_cantidad: formData.equipos_alquiler_compra_cantidad || '',
                equipos_alquiler_compra_vr_unit: formData.equipos_alquiler_compra_vr_unit || '',
                total_equipos_alquiler_compra: (formData.equipos_alquiler_compra_cantidad || 0) * (formData.equipos_alquiler_compra_vr_unit || 0),
              
                dotacion_participantes_cantidad: formData.dotacion_participantes_cantidad || '',
                dotacion_participantes_vr_unit: formData.dotacion_participantes_vr_unit || '',
                total_dotacion_participantes: (formData.dotacion_participantes_cantidad || 0) * (formData.dotacion_participantes_vr_unit || 0),
              
                carpetas_cantidad: formData.carpetas_cantidad || '',
                carpetas_vr_unit: formData.carpetas_vr_unit || '',
                total_carpetas: (formData.carpetas_cantidad || 0) * (formData.carpetas_vr_unit || 0),
              
                libretas_cantidad: formData.libretas_cantidad || '',
                libretas_vr_unit: formData.libretas_vr_unit || '',
                total_libretas: (formData.libretas_cantidad || 0) * (formData.libretas_vr_unit || 0),
              
                lapiceros_cantidad: formData.lapiceros_cantidad || '',
                lapiceros_vr_unit: formData.lapiceros_vr_unit || '',
                total_lapiceros: (formData.lapiceros_cantidad || 0) * (formData.lapiceros_vr_unit || 0),
              
                memorias_cantidad: formData.memorias_cantidad || '',
                memorias_vr_unit: formData.memorias_vr_unit || '',
                total_memorias: (formData.memorias_cantidad || 0) * (formData.memorias_vr_unit || 0),
              
                marcadores_papel_otros_cantidad: formData.marcadores_papel_otros_cantidad || '',
                marcadores_papel_otros_vr_unit: formData.marcadores_papel_otros_vr_unit || '',
                total_marcadores_papel_otros: (formData.marcadores_papel_otros_cantidad || 0) * (formData.marcadores_papel_otros_vr_unit || 0),
              
                impresos_cantidad: formData.impresos_cantidad || '',
                impresos_vr_unit: formData.impresos_vr_unit || '',
                total_impresos: (formData.impresos_cantidad || 0) * (formData.impresos_vr_unit || 0),
              
                labels_cantidad: formData.labels_cantidad || '',
                labels_vr_unit: formData.labels_vr_unit || '',
                total_labels: (formData.labels_cantidad || 0) * (formData.labels_vr_unit || 0),
              
                certificados_cantidad: formData.certificados_cantidad || '',
                certificados_vr_unit: formData.certificados_vr_unit || '',
                total_certificados: (formData.certificados_cantidad || 0) * (formData.certificados_vr_unit || 0),
              
                escarapelas_cantidad: formData.escarapelas_cantidad || '',
                escarapelas_vr_unit: formData.escarapelas_vr_unit || '',
                total_escarapelas: (formData.escarapelas_cantidad || 0) * (formData.escarapelas_vr_unit || 0),
              
                fotocopias_cantidad: formData.fotocopias_cantidad || '',
                fotocopias_vr_unit: formData.fotocopias_vr_unit || '',
                total_fotocopias: (formData.fotocopias_cantidad || 0) * (formData.fotocopias_vr_unit || 0),
              
                estacion_cafe_cantidad: formData.estacion_cafe_cantidad || '',
                estacion_cafe_vr_unit: formData.estacion_cafe_vr_unit || '',
                total_estacion_cafe: (formData.estacion_cafe_cantidad || 0) * (formData.estacion_cafe_vr_unit || 0),
              
                transporte_mensaje_cantidad: formData.transporte_mensaje_cantidad || '',
                transporte_mensaje_vr_unit: formData.transporte_mensaje_vr_unit || '',
                total_transporte_mensaje: (formData.transporte_mensaje_cantidad || 0) * (formData.transporte_mensaje_vr_unit || 0),
              
                refrigerios_cantidad: formData.refrigerios_cantidad || '',
                refrigerios_vr_unit: formData.refrigerios_vr_unit || '',
                total_refrigerios: (formData.refrigerios_cantidad || 0) * (formData.refrigerios_vr_unit || 0),
              
                infraestructura_fisica_cantidad: formData.infraestructura_fisica_cantidad || '',
                infraestructura_fisica_vr_unit: formData.infraestructura_fisica_vr_unit || '',
                total_infraestructura_fisica: (formData.infraestructura_fisica_cantidad || 0) * (formData.infraestructura_fisica_vr_unit || 0),
              
                gastos_generales_cantidad: formData.gastos_generales_cantidad || '',
                gastos_generales_vr_unit: formData.gastos_generales_vr_unit || '',
                total_gastos_generales: (formData.gastos_generales_cantidad || 0) * (formData.gastos_generales_vr_unit || 0),
              
                infraestructura_universitaria_cantidad: formData.infraestructura_universitaria_cantidad || '',
                infraestructura_universitaria_vr_unit: formData.infraestructura_universitaria_vr_unit || '',
                total_infraestructura_universitaria: (formData.infraestructura_universitaria_cantidad || 0) * (formData.infraestructura_universitaria_vr_unit || 0),
              
                imprevistos: formData.imprevistos || '',
              
                // Aportes Univalle
                escuela_departamento_porcentaje: formData.escuela_departamento_porcentaje || '',
                total_aportes_univalle: totalAportesUnivalle || ''
            };        
            break;        
        case 2:
            // Resumen Financiero
            pasoData = {
                fondo_comun: formData.total_ingresos * 0.3,
                facultad_instituto: formData.total_ingresos * 0.05,
                escuela_departamento: (formData.total_ingresos * (formData.escuela_departamento_porcentaje || 0) / 100),
            };
            break;
        default:
            break;
    }

    try {
        const dataToSend = {
            id_solicitud: idSolicitud,
            paso: activeStep + 1,
            hoja,
            id_usuario: userData?.id_usuario,
            name: userData?.name,
            ...pasoData,
        };

        // Debugging para asegurar los datos enviados
        console.log("Enviando Datos:", dataToSend);

        await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', dataToSend);
        
        // Mover al siguiente paso si todo fue exitoso
        setIsLoading(false); // Finalizar el loading
        setIsLoading(false); // Finalizar el loading
        setCompletedSteps((prevCompleted) => {
          const newCompleted = [...prevCompleted];
          if (!newCompleted.includes(activeStep)) {
            newCompleted.push(activeStep);
          }
          return newCompleted;
        });
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
        console.error('Error al guardar el progreso:', error);
        if (error.response) {
            console.error('Detalles del error:', error.response.data);
        }
    }
};

  const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    const hoja = 3;
  
    // Resumen Financiero
    const pasoData = {
      fondo_comun: formData.total_ingresos * 0.3,
      facultad_instituto: formData.total_ingresos * 0.05,
      escuela_departamento: (formData.total_ingresos * (formData.escuela_departamento_porcentaje || 0) / 100),
    };
  
    try {
      // Guardar los datos del último paso
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoData,
        paso: 3,
        hoja,
        userData: {
          id_usuario,
          name: userData.name,
        },
      });
  
      setShowModal(true);  // Mostrar el modal cuando se guarda correctamente
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };
  

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection3 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection3 formData={formData} handleNumberInputChange={handleInputChange} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0} totalGastos={formData.total_gastos || 0} />;
      case 2:
        return <Step3FormSection3 formData={formData} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0} totalGastos={formData.total_gastos || 0} totalAportesUnivalle={totalAportesUnivalle || 0} />;
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex) => {
    if (completedSteps.includes(stepIndex) || stepIndex === activeStep) {
      setActiveStep(stepIndex); // Permite cambiar solo a pasos completados o el actual
    }
  };
  

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        sx={{
          '& .MuiStepIcon-root': {
            fontSize: '24px',
            color: '#4F4F4F', // Color por defecto
          },
          '& .MuiStepIcon-root.Mui-active': {
            fontSize: '30px',
            color: '#0056b3', // Azul para el paso activo
          },
          '& .MuiStepIcon-root.Mui-completed': {
            fontSize: '24px',
            color: '#1976d2', // Azul para pasos completados
          },
        }}
      >
      {steps.map((label, index) => (
        <Step key={index} sx={{marginBottom:'20px'}}>      
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: completedSteps.includes(index) || index === activeStep ? 'pointer' : 'default',
                }}
              >
                {label}
              </StepLabel>
            </Step>
        ))}
      </Stepper>


      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? () => setShowModal(true) : handleNext} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>Formulario Presupuesto Completado</DialogTitle>
          <DialogContent>
            <DialogContentText>
             Los datos del Formulario Presupuesto han sido guardados, ¿Desea continuar con el siguiente formulario?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCurrentSection(3)} color="primary">
              Continuar
            </Button>
            <Button onClick={() => window.location.href = '/'} color="secondary">
              Salir
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}

export default FormSection3;

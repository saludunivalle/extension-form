import { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, CircularProgress} from '@mui/material';
import Step1FormSection2 from './Step1FormSection2';
import Step2FormSection2 from './Step2FormSection2';
import Step3FormSection2 from './Step3FormSection2';
import axios from 'axios'; 
import { useLocation } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import PropTypes from "prop-types";

import CheckIcon from '@mui/icons-material/Check'; 
import { styled } from '@mui/system';

  /* 
  Este componente se encarga de cambiar el color de fondo, el color del texto y otros estilos visuales del ícono:
  - Si el paso está completado (`completed`), el fondo es azul oscuro y el texto blanco.
  - Si el paso está activo (`active`), el fondo también es azul oscuro y el texto blanco. (Sin embargo con el otro componente se le añade el icono check)
  - Si el paso está pendiente, el fondo es gris claro y el texto gris oscuro.
  */
  const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%', 
    backgroundColor: ownerState.completed
      ? '#0056b3' 
      : ownerState.active
      ? '#0056b3' 
      : '#E0E0E0', 
    color: ownerState.completed || ownerState.active ? '#FFFFFF' : '#4F4F4F', 
    fontWeight: 'bold',
  }));
  
    /*
  Este componente se encarga de renderizar el contenido del ícono.
  - Si el paso está completado (`completed`), muestra un ícono de verificación (`CheckIcon`).
  - Si el paso no está completado, muestra el ícono correspondiente al paso (`icon`).
  */
  const CustomStepIcon = ({ active, completed, icon }) => (
    <CustomStepIconRoot ownerState={{ active, completed }}>
      {completed ? <CheckIcon /> : icon}
    </CustomStepIconRoot>
  );
  

function FormSection2({ formData, handleInputChange, setCurrentSection, userData, totalAportesUnivalle, currentStep }) {
  
  const [activeStep, setActiveStep] = useState(currentStep);  
  const [extraExpenses, setExtraExpenses] = useState([]); 
  const id_usuario = userData?.id_usuario;
  const location = useLocation();
  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); 
  const [isLoading, setIsLoading] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0); 



  const steps = ['Datos Generales', 'Ingresos y Gastos', 'Resumen Financiero'];

  const [totalGastos, setTotalGastos] = useState(0);

  const handleUpdateTotalGastos = (total) => {
    setTotalGastos(total); 
  };

  useEffect(() => {
    console.log('Formulario data recibido: ', formData);
    console.log('Datos del usuario: ', userData);
  }, [formData, userData]);

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      setActiveStep(0); 
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);  

  useEffect(() => {
    if (!idSolicitud || isNaN(parseInt(idSolicitud, 10))) {
      alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      window.location.href = '/';
    }
  }, [idSolicitud]);
  
  /*
    Lógica del botón "Siguiente"
    - Valida los campos del paso actual. Si hay errores, detiene el avance.
    - Construye los datos necesarios (`pasoData`) según el paso activo, incluyendo archivos si aplica.
    - Envía los datos al servidor usando `axios` y maneja errores de la solicitud.
    - Si el envío es exitoso, marca el paso como completado, avanza al siguiente y actualiza el estado del progreso.
  */

    const isValidExpense = (expense) => {
      const cantidad = parseFloat(expense.cantidad) || 0;
      const vr_unit  = parseFloat(expense.vr_unit) || 0;
      return cantidad > 0 && vr_unit > 0;
    };

    const gastosStructure2 = [
      { id_conceptos: '1', label: 'Costos de Personal' },
      { id_conceptos: '1,1', label: 'Personal Nombrado de la Universidad (Max 70%)' },
      { id_conceptos: '1,2', label: 'Honorarios Docentes Externos (Horas)' },
      { id_conceptos: '1.3', label: 'Otro Personal - Subcontratos' },
      { id_conceptos: '2', label: 'Materiales y Suministros' },
      { id_conceptos: '3', label: 'Gastos de Alojamiento' },
      { id_conceptos: '4', label: 'Gastos de Alimentación' },
      { id_conceptos: '5', label: 'Gastos de Transporte' },
      { id_conceptos: '6', label: 'Equipos Alquiler o Compra' },
      { id_conceptos: '7', label: 'Dotación Participantes' },
      { id_conceptos: '7,1', label: 'Carpetas' },
      { id_conceptos: '7,2', label: 'Libretas' },
      { id_conceptos: '7,3', label: 'Lapiceros' },
      { id_conceptos: '7,4', label: 'Memorias' },
      { id_conceptos: '7,5', label: 'Marcadores, papel, etc,' },
      { id_conceptos: '8', label: 'Impresos' },
      { id_conceptos: '8,1', label: 'Labels' },
      { id_conceptos: '8,2', label: 'Certificados' },
      { id_conceptos: '8,3', label: 'Escarapelas' },
      { id_conceptos: '8,4', label: 'Fotocopias' },
      { id_conceptos: '9', label: 'Impresos' },
      { id_conceptos: '9,1', label: 'Estación de café' },
      { id_conceptos: '9,2', label: 'Transporte de mensaje' },
      { id_conceptos: '9,3', label: 'Refrigerios' },
      { id_conceptos: '10', label: 'Inversión en Infraestructura Física' },
      { id_conceptos: '11', label: 'Gastos Generales' },
      { id_conceptos: '12', label: 'Valor Infraestructura Universitaria' },
      { id_conceptos: '13', label: 'Imprevistos (Max 5% del 1 al 8)' },
      { id_conceptos: '14', label: 'Costos Administrativos del proyecto' },
      { id_conceptos: '15', label: 'Gasto Extra 1' },
      { id_conceptos: '15,1', label: 'Gasto Extra 2' },
      { id_conceptos: '15,2', label: 'Gasto Extra 3' },
      { id_conceptos: '15,3', label: 'Gasto Extra 4' },
    ];

    // En handleSaveGastos
    const handleSaveGastos = async () => {
      // Gastos regulares (considerando los ids con comas, por ejemplo "1,1")
      const gastosRegulares = gastosStructure2.map(item => {
        // Usar el id tal cual, sin reemplazar la coma
        const key = item.id_conceptos;
        return {
          id_conceptos: key,
          cantidad: parseFloat(formData[`${key}_cantidad`] || 0),
          valor_unit: parseFloat(formData[`${key}_vr_unit`] || 0),
          valor_total: (formData[`${key}_cantidad`] || 0) * (formData[`${key}_vr_unit`] || 0)
        };
      });
      
      // Gastos extras mediante extraExpenses
      const gastosExtras = extraExpenses.filter(expense => isValidExpense(expense))
        .map(expense => ({
          id_conceptos: '15',
          cantidad: expense.cantidad,
          valor_unit: expense.vr_unit,
          valor_total: expense.cantidad * expense.vr_unit
        }));
      
      // Combinar ambos conjuntos de gastos
      const todosLosGastos = [...gastosRegulares, ...gastosExtras].filter(g => g.id_conceptos);
      
      try {
        const response = await axios.post('https://siac-extension-server.vercel.app/guardarGastos', {
          id_solicitud: formData.id_solicitud.toString(),
          gastos: todosLosGastos
        });
        
        if (response.data.success) {
          alert("✅ Gastos registrados (incluyendo extras)");
          // Resetear campos
          const newFormData = { ...formData };
          gastosStructure2.forEach(item => {
            const key = item.id_conceptos; // Usar el id original (con comas)
            delete newFormData[`${key}_cantidad`];
            delete newFormData[`${key}_vr_unit`];
          });
          handleInputChange({ target: { name: 'reset', value: newFormData } });
          setExtraExpenses([]); // Reinicia los gastos extras
        }
      } catch (error) {
        console.error("Error:", error.response?.data);
        alert(`🚨 Error: ${error.response?.data?.error || error.message}`);
      }
    };
  
  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setIsLoading(true);
      const hoja = 2; 
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
                  '1_cantidad': formData['1_cantidad'] || '',
                  '1_vr_unit': formData['1_vr_unit'] || '',
                  total_costos_personal: (formData['1_cantidad'] || 0) * (formData['1_vr_unit'] || 0),
                
                  '1.1_cantidad': formData['1.1_cantidad'] || '',
                  '1.1_vr_unit': formData['1.1_vr_unit']  || '',
                  total_personal_universidad: (formData['1.1_cantidad'] || 0) * (formData['1.1_vr_unit'] || 0),
                
                  '1.2_cantidad': formData['1.2_cantidad'] || '',
                  '1.2_vr_unit': formData['1.2_vr_unit']  || '',
                  total_honorarios_docentes: (formData['1.2_cantidad'] || 0) * (formData['1.2_vr_unit'] || 0),
                
                  '1.3_cantidad': formData['1.3_cantidad'] || '',
                  '1.3_vr_unit': formData['1.3_vr_unit']  || '',
                  total_otro_personal: (formData['1.3_cantidad'] || 0) * (formData['1.3_vr_unit'] || 0),
                
                  '2_cantidad': formData['2_cantidad'] || '',
                  '2_vr_unit': formData['2_vr_unit'] || '',
                  total_materiales_sumi: (formData['2_cantidad'] || 0) * (formData['2_vr_unit'] || 0),
                
                  '3_cantidad': formData['3_cantidad'] || '',
                  '3_vr_unit': formData['3_vr_unit'] || '',
                  total_gastos_alojamiento: (formData['3_cantidad'] || 0) * (formData['3_vr_unit'] || 0),
                
                  '4_cantidad': formData['4_cantidad'] || '',
                  '4_vr_unit': formData['4_vr_unit'] || '',
                  total_gastos_alimentacion: (formData['4_cantidad'] || 0) * (formData['4_vr_unit'] || 0),
                
                  '5_cantidad': formData['5_cantidad'] || '',
                  '5_vr_unit': formData['5_vr_unit'] || '',
                  total_gastos_transporte: (formData['5_cantidad'] || 0) * (formData['5_vr_unit'] || 0),
                
                  '6_cantidad': formData['6_cantidad'] || '',
                  '6_vr_unit': formData['6_vr_unit'] || '',
                  total_equipos_alquiler_compra: (formData['6_cantidad'] || 0) * (formData['6_vr_unit'] || 0),
                
                  '7_cantidad': formData['7_cantidad'] || '',
                  '7_vr_unit': formData['7_vr_unit'] || '',
                  total_dotacion_participantes: (formData['7_cantidad'] || 0) * (formData['7_vr_unit'] || 0),
                
                  '7.1_cantidad': formData['7.1_cantidad'] || '',
                  '7.1_vr_unit': formData['7.1_vr_unit'] || '',
                  total_carpetas: (formData['7.1_cantidad'] || 0) * (formData['7.1_vr_unit'] || 0),
                
                  '7.2_cantidad': formData['7.2_cantidad'] || '',
                  '7.2_vr_unit': formData['7.2_vr_unit'] || '',
                  total_libretas: (formData['7.2_cantidad'] || 0) * (formData['7.2_vr_unit'] || 0),
                
                  '7.3_cantidad': formData['7.3_cantidad'] || '',
                  '7.3_vr_unit': formData['7.3_vr_unit'] || '',
                  total_lapiceros: (formData['7.3_cantidad'] || 0) * (formData['7.3_vr_unit'] || 0),
                
                  '7.4_cantidad': formData['7.4_cantidad'] || '',
                  '7.4_vr_unit': formData['7.4_vr_unit'] || '',
                  total_memorias: (formData['7.4_cantidad'] || 0) * (formData['7.4_vr_unit'] || 0),
                
                  '7.5_cantidad': formData['7.5_cantidad'] || '',
                  '7.5_vr_unit': formData['7.5_vr_unit'] || '',
                  total_marcadores_papel_otros: (formData['7.5_cantidad'] || 0) * (formData['7.5_vr_unit'] || 0),
                
                  '8_cantidad': formData['8_cantidad'] || '',
                  '8_vr_unit': formData['8_vr_unit'] || '',
                  total_impresos: (formData['8_cantidad'] || 0) * (formData['8_vr_unit'] || 0),
                
                  '8.1_cantidad': formData['8.1_cantidad'] || '',
                  '8.1_vr_unit': formData['8.1_vr_unit'] || '',
                  total_labels: (formData['8.1_cantidad'] || 0) * (formData['8.1_vr_unit'] || 0),
                
                  '8.2_cantidad': formData['8.2_cantidad'] || '',
                  '8.2_vr_unit': formData['8.2_vr_unit'] || '',
                  total_certificados: (formData['8.2_cantidad'] || 0) * (formData['8.2_vr_unit'] || 0),
                
                  '8.3_cantidad': formData['8.3_cantidad'] || '',
                  '8.3_vr_unit': formData['8.3_vr_unit'] || '',
                  total_escarapelas: (formData['8.3_cantidad'] || 0) * (formData['8.3_vr_unit'] || 0),
                
                  '8.4_cantidad': formData['8.4_cantidad'] || '',
                  '8.4_vr_unit': formData['8.4_vr_unit'] || '',
                  total_fotocopias: (formData['8.4_cantidad'] || 0) * (formData['8.4_vr_unit'] || 0),

                  '9_cantidad': formData['9_cantidad'] || '',
                  '9_vr_unit': formData['9_vr_unit'] || '',
                  total_impresos2: (formData['9_cantidad'] || 0) * (formData['9_vr_unit'] || 0),

                  '9.1_cantidad': formData['9.1_cantidad'] || '',
                  '9.1_vr_unit': formData['9.1_vr_unit'] || '',
                  total_estacion_cafe: (formData['9.1_cantidad'] || 0) * (formData['9.1_vr_unit'] || 0),
                
                  '9.2_cantidad': formData['9.2_cantidad'] || '',
                  '9.2_vr_unit': formData['9.2_vr_unit'] || '',
                  total_transporte_mensaje: (formData['9.2_cantidad'] || 0) * (formData['9.2_vr_unit'] || 0),
                
                  '9.3_cantidad': formData['9.3_cantidad'] || '',
                  '9.3_vr_unit': formData['9.3_vr_unit'] || '',
                  total_refrigerios: (formData['9.3_cantidad'] || 0) * (formData['9.3_vr_unit'] || 0),
                
                  '10_cantidad': formData['10_cantidad'] || '',
                  '10_vr_unit': formData['10_vr_unit'] || '',
                  total_infraestructura_fisica: (formData['10_cantidad'] || 0) * (formData['10_vr_unit'] || 0),
                
                  '11_cantidad': formData['11_cantidad'] || '',
                  '11_vr_unit': formData['11_vr_unit'] || '',
                  total_gastos_generales: (formData['11_cantidad'] || 0) * (formData['11_vr_unit'] || 0),
                
                  '12_cantidad': formData['12_cantidad'] || '',
                  '12_vr_unit': formData['12_vr_unit'] || '',
                  total_infraestructura_universitaria: (formData['12_cantidad'] || 0) * (formData['12_vr_unit'] || 0),
                
                  imprevistos: formData['13_cantidad'] || '',
                
                  // Aportes Univalle
                  escuela_departamento_porcentaje: formData['14_cantidad'] || '',
                  total_aportes_univalle: totalAportesUnivalle || '',

                  // Gastos Extra
                  extraExpenses: formData.extraExpenses
                    ? formData.extraExpenses.map(expense => ({
                        name: expense.name || '',
                        cantidad: parseFloat(expense.cantidad) || 0,
                        vr_unit: parseFloat(expense.vr_unit) || 0,
                        total: (parseFloat(expense.cantidad) || 0) * (parseFloat(expense.vr_unit) || 0)
                      }))
                    : [],
              };
              const posiblesIDsExtras = ['15', '15,1', '15,2', '15,3'];

              const gastosExtras = extraExpenses
                .filter(expense => isValidExpense(expense))
                .map((expense, index) => {
                  const id_conceptos = expense.id_conceptos || posiblesIDsExtras[index % posiblesIDsExtras.length];
                  const cantidad = parseFloat(expense.cantidad) || 0;
                  const valor_unit = parseFloat(expense.vr_unit) || 0;
                  return {
                    id_conceptos,
                    cantidad,
                    valor_unit,
                    valor_total: cantidad * valor_unit,
                  };
                });
              
              if (gastosExtras.length > 0) {
                pasoData.extraGastos = gastosExtras;
              }
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
          setCompletedSteps((prevCompleted) => {
            const newCompleted = [...prevCompleted];
            if (!newCompleted.includes(activeStep)) {
              newCompleted.push(activeStep);
            }
            return newCompleted;
          });         
          
          if (activeStep === 1) {
            await handleSaveGastos();
          }
        
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setHighestStepReached((prev) => Math.max(prev, activeStep + 1));

      } catch (error) {
          console.error('Error al guardar el progreso:', error);
          if (error.response) {
              console.error('Detalles del error:', error.response.data);
          }
      }
    }
  };

  //Lógica del botón "Atrás"
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
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
  

  /*
    - Renderiza el componente correspondiente al paso actual del formulario basado en el índice del paso (`step`).
    - Proporciona las props necesarias para cada componente, incluyendo datos del formulario y funciones de manejo de eventos.
    - Devuelve `null` si el paso no es válido.
  */

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection2 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection2 formData={formData} handleNumberInputChange={handleInputChange} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0} totalGastos={formData.total_gastos || 0} updateTotalGastos={handleUpdateTotalGastos}/>;
      case 2:
        return <Step3FormSection2 formData={formData} handleInputChange={handleInputChange} totalIngresos={formData.total_ingresos || 0}  totalAportesUnivalle={totalAportesUnivalle || 0} totalGastos={totalGastos} />;
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
    }
  };

  return (
    <Box>
        <Stepper
          activeStep={activeStep}
          sx={{
            '& .MuiStepLabel-root': {
              cursor: 'default', // Por defecto, los pasos no son clicables
            },
            '& .MuiStepLabel-root.Mui-completed': {
              cursor: 'pointer', // Pasos completados son clicables
            },
            '& .MuiStepLabel-root.Mui-active': {
              cursor: 'pointer', // Paso activo es clicable
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={index} sx={{marginBottom: '20px'}}>
              <StepLabel
                onClick={() => handleStepClick(index)} // Navegación controlada
                sx={{
                  '& .MuiStepLabel-label': {
                    color: index === activeStep ? '#FFFFFF' : index < activeStep ? '#4F4F4F' : '#A0A0A0', // Blanco activo, gris oscuro completado, gris claro inactivo
                    backgroundColor: index === activeStep ? '#0056b3' : 'transparent', // Fondo azul para paso activo
                    padding: index === activeStep ? '5px 10px' : '0', // Espaciado interno solo en activo
                    borderRadius: '20px', // Bordes redondeados para fondo activo
                    fontWeight: index === activeStep ? 'bold' : 'normal',
                    cursor: index <= highestStepReached ? 'pointer' : 'default', // Cursor pointer solo para pasos alcanzables
                  },
                  '& .MuiStepIcon-root': {
                    color: index < activeStep ? '#0056b3' : '#E0E0E0', // Azul para pasos completados, gris para inactivos
                    fontSize: '28px', // Tamaño del ícono
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#0056b3', // Azul para el ícono del paso activo
                  },
                  '& .MuiStepIcon-text': {
                    fill: '#FFFFFF', // Color blanco para el número del paso activo
                  },
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

FormSection2.propTypes = {
  formData: PropTypes.shape({
    nombre_actividad: PropTypes.string,
    fecha_solicitud: PropTypes.string,
    ingresos_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingresos_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ingresos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costos_personal_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costos_personal_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    personal_universidad_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    personal_universidad_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    honorarios_docentes_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    honorarios_docentes_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    otro_personal_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    otro_personal_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  setCurrentSection: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  totalAportesUnivalle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FormSection2;

import React, { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, Modal, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

import Step1FormSection4 from './Step1FormSection4';
import Step2FormSection4 from './Step2FormSection4';
import Step3FormSection4 from './Step3FormSection4';
import Step4FormSection4 from './Step4FormSection4';
import Step5FormSection4 from './Step5FormSection4';

function FormSection4({ formData, handleInputChange, userData, currentStep }) {
  const [activeStep, setActiveStep] = useState(currentStep); // Usar currentStep como el paso inicial
  const [openModal, setOpenModal] = useState(false); // Estado para el modal
  const id_usuario = userData?.id_usuario;
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const location = useLocation(); // Obtener la ubicación actual
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading del botón
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highestStepReached, setHighestStepReached] = useState(0); // Máximo paso alcanzado

  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];

  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      console.warn('Paso inicial fuera de rango. Reiniciando al primer paso.');
      setActiveStep(0);
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);
  
  useEffect(() => {
    if (!idSolicitud || isNaN(parseInt(idSolicitud, 10))) {
      alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      navigate('/');
    }
  }, [idSolicitud]);
  
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      console.warn('Paso inicial fuera de rango. Reiniciando al primer paso.');
      setActiveStep(0);
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, steps.length]);
  

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setIsLoading(true); // Finalizar el loading
      const hoja = 4; // Formulario 2 va en SOLICITUDES

      const completarValoresConNo = (data) => {
          const completado = {};
          for (let key in data) {
              completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
          }
          return completado;
      };
      
      let pasoData = {};

      switch (activeStep) {
          case 0:
              pasoData = {
                  descripcionPrograma: formData.descripcionPrograma || 'No',
                  identificacionNecesidades: formData.identificacionNecesidades || 'No',
              };
              break;
          case 1:
              pasoData = {
                  atributosBasicos: formData.atributosBasicos || 'No',
                  atributosDiferenciadores: formData.atributosDiferenciadores || 'No',
                  competencia: formData.competencia || 'No',
                  programa: formData.programa || 'No',
                  programasSimilares: formData.programasSimilares || 'No',
                  estrategiasCompetencia: formData.estrategiasCompetencia || 'No',
              };
              break;
          case 2:
              pasoData = {
                  personasInteresChecked: formData.personasInteresChecked || 'No',
                  personasMatriculadasChecked: formData.personasMatriculadasChecked || 'No',
                  otroInteres: formData.otroInteres || 'No',
                  innovacion: formData.innovacion || 'No',
                  solicitudExterno: formData.solicitudExterno || 'No',
                  interesSondeo: formData.interesSondeo || 'No',
                  otroMercadeo: formData.otroMercadeo || 'No',
                  llamadas: formData.llamadas || 'No',
                  encuestas: formData.encuestas || 'No',
                  webinar: formData.webinar || 'No',
                  pautas_redes: formData.pautas_redes || 'No',
                  otroEstrategias: formData.otroEstrategias || 'No',
                  preregistroFisico: formData.preregistroFisico || 'No',
                  preregistroGoogle: formData.preregistroGoogle || 'No',
                  preregistroOtro: formData.preregistroOtro || 'No',
              };
              break;
          case 3:
              pasoData = {
                  gremios: formData.gremios || 'No',
                  sectores_empresariales: formData.sectores_empresariales || 'No',
                  politicas_publicas: formData.politicas_publicas || 'No',
                  otros_mesas_trabajo: formData.otros_mesas_trabajo || 'No',
                  focusGroup: formData.focusGroup || 'No',
                  desayunosTrabajo: formData.desayunosTrabajo || 'No',
                  almuerzosTrabajo: formData.almuerzosTrabajo || 'No',
                  openHouse: formData.openHouse || 'No',
                  ferias_colegios: formData.ferias_colegios || 'No',
                  ferias_empresarial: formData.ferias_empresarial || 'No',
                  otros_mercadeo: formData.otros_mercadeo || 'No',
                  valorEconomico: formData.valorEconomico || 'No',
                  modalidadPresencial: formData.modalidadPresencial || 'No',
                  modalidadVirtual: formData.modalidadVirtual || 'No',
                  modalidadSemipresencial: formData.modalidadSemipresencial || 'No',
                  traslados_docente: formData.traslados_docente || 'No',
                  modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia || 'No',
              };
              break;
          case 4:
              pasoData = {
                  beneficiosTangibles: formData.beneficiosTangibles || 'No',
                  beneficiosIntangibles: formData.beneficiosIntangibles || 'No',
                  particulares: formData.particulares || 'No',
                  colegios: formData.colegios || 'No',
                  empresas: formData.empresas || 'No',
                  egresados: formData.egresados || 'No',
                  colaboradores: formData.colaboradores || 'No',
                  otros_publicos_potenciales: formData.otros_publicos_potenciales || 'No',
                  tendenciasActuales: formData.tendenciasActuales || 'No',
                  dofaDebilidades: formData.dofaDebilidades || 'No',
                  dofaOportunidades: formData.dofaOportunidades || 'No',
                  dofaFortalezas: formData.dofaFortalezas || 'No',
                  dofaAmenazas: formData.dofaAmenazas || 'No',
                  paginaWeb: formData.paginaWeb || 'No',
                  facebook: formData.facebook || 'No',
                  instagram: formData.instagram || 'No',
                  linkedin: formData.linkedin || 'No',
                  correo: formData.correo || 'No',
                  prensa: formData.prensa || 'No',
                  boletin: formData.boletin || 'No',
                  llamadas_redes: formData.llamadas_redes || 'No',
                  otro_canal: formData.otro_canal || 'No',
              };
              break;
          default:
              break;
      }

      const pasoDataCompleto = completarValoresConNo(pasoData);

      try {
          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
              id_solicitud: idSolicitud,
              ...pasoDataCompleto,
              paso: activeStep + 1,
              hoja,
              id_usuario: userData.id_usuario,
              name: userData.name,
          });
          setIsLoading(false); // Finalizar el loading
          setCompletedSteps((prevCompleted) => {
            const newCompleted = [...prevCompleted];
            if (!newCompleted.includes(activeStep)) {
              newCompleted.push(activeStep);
            }
            return newCompleted;
          });                  
        
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setHighestStepReached((prev) => Math.max(prev, activeStep + 1));
      } catch (error) {
          console.error('Error al guardar el progreso:', error.response?.data || error.message);
      }
    }
};

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Finalizar el loading

      const hoja = 4; // Cambia este valor según la hoja a la que corresponda el formulario

      const completarValoresConNo = (data) => {
          const completado = {};
          for (let key in data) {
              completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
          }
          return completado;
      };

      const pasoData = {
          beneficiosTangibles: formData.beneficiosTangibles || 'No',
          beneficiosIntangibles: formData.beneficiosIntangibles || 'No',
          particulares: formData.particulares || 'No',
          colegios: formData.colegios || 'No',
          empresas: formData.empresas || 'No',
          egresados: formData.egresados || 'No',
          colaboradores: formData.colaboradores || 'No',
          otros_publicos_potenciales: formData.otros_publicos_potenciales || 'No',
          tendenciasActuales: formData.tendenciasActuales || 'No',
          dofaDebilidades: formData.dofaDebilidades || 'No',
          dofaOportunidades: formData.dofaOportunidades || 'No',
          dofaFortalezas: formData.dofaFortalezas || 'No',
          dofaAmenazas: formData.dofaAmenazas || 'No',
          paginaWeb: formData.paginaWeb || 'No',
          facebook: formData.facebook || 'No',
          instagram: formData.instagram || 'No',
          linkedin: formData.linkedin || 'No',
          correo: formData.correo || 'No',
          prensa: formData.prensa || 'No',
          boletin: formData.boletin || 'No',
          llamadas: formData.llamadas || 'No',
          otro_canal: formData.otro_canal || 'No',
      };

      const pasoDataCompleto = completarValoresConNo(pasoData);

      try {
          await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
              id_solicitud: idSolicitud, // El ID único de la solicitud
              ...pasoDataCompleto, // Datos del último paso (Paso 5)
              paso: 5, // El número del último paso
              hoja, // Indica qué hoja se está usando
              id_usuario: userData.id_usuario, // Enviar el id_usuario
              name: userData.name, // Enviar el nombre del usuario
          });
          setIsLoading(false); // Finalizar el loading
          setOpenModal(true); // Abre el modal
      } catch (error) {
          console.error('Error al guardar los datos del último paso:', error);
      }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= highestStepReached) {
      setActiveStep(stepIndex); // Cambiar al paso clicado si es alcanzado
    }
  };

  

  const handleCloseModal = () => {
    setOpenModal(false); // Cerrar el modal
    navigate('/'); // Navegar al inicio
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Box sx={{ backgroundColor: 'white', padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6">Se ha enviado todos los formularios con éxito</Typography>
            <Button variant="contained" onClick={handleCloseModal} sx={{ marginTop: '10px' }}>
              Salir al inicio
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default FormSection4;

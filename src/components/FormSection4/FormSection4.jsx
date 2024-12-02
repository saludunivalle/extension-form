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

  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];

  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  const handleNext = async () => {
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
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
        console.error('Error al guardar el progreso:', error.response?.data || error.message);
    }
};

const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
      <Stepper activeStep={activeStep} sx={{
        '& .MuiStepLabel-label': {
          color: '#4F4F4F', // Color estándar para los labels no activos
          fontWeight: 'normal', // Peso normal para los labels no activos
          fontSize: '14px', // Tamaño estándar para los no activos
        },
        '& .MuiStepLabel-label.Mui-active': {
          color: '#0056b3', // Azul intenso para el texto del paso activo
          fontWeight: 'bold', // Negrilla para el texto activo
          fontSize: '16px', // Tamaño más grande para el texto activo
        },
        '& .MuiStepIcon-root': {
          fontSize: '24px', // Tamaño estándar para los íconos no activos
          color: '#4F4F4F', // Color estándar para los íconos no activos
        },
        '& .MuiStepIcon-root.Mui-active': {
          fontSize: '30px', // Tamaño más grande para íconos activos
          color: '#0056b3', // Azul intenso para los íconos activos
        },
        '& .MuiStepIcon-root.Mui-completed': {
          fontSize: '24px', // Tamaño estándar para íconos completados
          color: '#1976d2', // Azul para los íconos completados (el mismo color que el chulito)
        },
      }}>
        {steps.map((label, index) => (
          <Step key={index} sx={{ marginBottom: '20px' }}>
            <StepLabel>{label}</StepLabel>
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

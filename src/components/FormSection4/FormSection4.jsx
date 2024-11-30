import React, { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, Modal } from '@mui/material';
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

  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];

  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usa el id_solicitud del localStorage

  const handleNext = async () => {
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
          descripcionPrograma: formData.descripcionPrograma,
          identificacionNecesidades: formData.identificacionNecesidades,
        };
        break;
      case 1:
        pasoData = {
          atributosBasicos: formData.atributosBasicos,
          atributosDiferenciadores: formData.atributosDiferenciadores,
          competencia: formData.competencia,
          programa: formData.programa,
          programasSimilares: formData.programasSimilares,
          estrategiasCompetencia: formData.estrategiasCompetencia,
        };
        break;
      case 2:
        pasoData = {
          personasInteresChecked: formData.personasInteresChecked,
          personasMatriculadasChecked: formData.personasMatriculadasChecked,
          otroInteres: formData.otroInteres,
          innovacion: formData.innovacion,
          solicitudExterno: formData.solicitudExterno,
          interesSondeo: formData.interesSondeo,
          otroMercadeo: formData.otroMercadeo,
          llamadas: formData.llamadas,
          encuestas: formData.encuestas,
          webinar: formData.webinar,
          pautas_redes: formData.pautas_redes,
          otroEstrategias: formData.otroEstrategias,
          preregistroFisico: formData.preregistroFisico,
          preregistroGoogle: formData.preregistroGoogle,
          preregistroOtro: formData.preregistroOtro,
        };
        break;
      case 3:
        pasoData = {
          gremios: formData.gremios,
          sectores_empresariales: formData.sectores_empresariales,
          politicas_publicas: formData.politicas_publicas,
          otros_mesas_trabajo: formData.otros_mesas_trabajo,
          focusGroup: formData.focusGroup,
          desayunosTrabajo: formData.desayunosTrabajo,
          almuerzosTrabajo: formData.almuerzosTrabajo,
          openHouse: formData.openHouse,
          ferias_colegios: formData.ferias_colegios,
          ferias_empresarial: formData.ferias_empresarial,
          otros_mercadeo: formData.otros_mercadeo,
          valorEconomico: formData.valorEconomico,
          modalidadPresencial: formData.modalidadPresencial,
          modalidadVirtual: formData.modalidadVirtual,
          modalidadSemipresencial: formData.modalidadSemipresencial,
          traslados_docente: formData.traslados_docente,
          modalidad_asistida_tecnologia: formData.modalidad_asistida_tecnologia,
        };
        break;
      case 4:
        pasoData = {
          beneficiosTangibles: formData.beneficiosTangibles,
          beneficiosIntangibles: formData.beneficiosIntangibles,
          particulares: formData.particulares,
          colegios: formData.colegios,
          empresas: formData.empresas,
          egresados: formData.egresados,
          colaboradores: formData.colaboradores,
          otros_publicos_potenciales: formData.otros_publicos_potenciales,
          tendenciasActuales: formData.tendenciasActuales,
          dofaDebilidades: formData.dofaDebilidades,
          dofaOportunidades: formData.dofaOportunidades,
          dofaFortalezas: formData.dofaFortalezas,
          dofaAmenazas: formData.dofaAmenazas,
          paginaWeb: formData.paginaWeb,
          facebook: formData.facebook,
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          correo: formData.correo,
          prensa: formData.prensa,
          boletin: formData.boletin,
          llamadas_redes: formData.llamadas_redes,
          otro_canal: formData.otro_canal,
        };
        break;
      default:
        break;
    }
  
    const pasoDataCompleto = completarValoresConNo(pasoData);
    console.log('Datos enviados al backend:', pasoDataCompleto);
  
    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoDataCompleto,
        paso: activeStep + 1,
        hoja,
        userData: {
          id_usuario,
          name: userData.name,
        }
      });
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error('Error al guardar el progreso:', error.response?.data || error.message);
    }
  };
  

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    const hoja = 4; // Cambia este valor según la hoja a la que corresponda el formulario

    const completarValoresConNo = (data) => {
      const completado = {};
      for (let key in data) {
        completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
      }
      return completado;
    };

    const pasoData = {
      beneficiosTangibles: formData.beneficiosTangibles,
      beneficiosIntangibles: formData.beneficiosIntangibles,
      particulares: formData.particulares,
      colegios: formData.colegios,
      empresas: formData.empresas,
      egresados: formData.egresados,
      colaboradores: formData.colaboradores,
      otros_publicos_potenciales: formData.otros_publicos_potenciales,
      tendenciasActuales: formData.tendenciasActuales,
      dofaDebilidades: formData.dofaDebilidades,
      dofaOportunidades: formData.dofaOportunidades,
      dofaFortalezas: formData.dofaFortalezas,
      dofaAmenazas: formData.dofaAmenazas,
      paginaWeb: formData.paginaWeb,
      facebook: formData.facebook,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      correo: formData.correo,
      prensa: formData.prensa,
      boletin: formData.boletin,
      llamadas: formData.llamadas,
      otro_canal: formData.otro_canal,
    };

    const pasoDataCompleto = completarValoresConNo(pasoData);

    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID único de la solicitud
        formData: pasoDataCompleto, // Datos del último paso (Paso 5)
        paso: 5, // El número del último paso
        hoja, // Indica qué hoja se está usando
        userData: {
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
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
        <Button variant="contained" color="primary" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
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

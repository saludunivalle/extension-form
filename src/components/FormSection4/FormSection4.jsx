import React, { useEffect, useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import Step1FormSection4 from './Step1FormSection4';
import Step2FormSection4 from './Step2FormSection4';
import Step3FormSection4 from './Step3FormSection4';
import Step4FormSection4 from './Step4FormSection4';
import Step5FormSection4 from './Step5FormSection4';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection4({ formData, handleInputChange, setCurrentSection, userData }) {
  const [activeStep, setActiveStep] = useState(0);
  const id_usuario = userData?.id_usuario;

  const steps = [
    'Actividades de Mercadeo Relacional',
    'Valor Económico de los Programas',
    'Modalidad de Ejecución',
    'Beneficios Ofrecidos',
    'DOFA del Programa',
  ];

  const [idSolicitud, setIdSolicitud] = useState(null); // Para almacenar el id_solicitud

  useEffect(() => {
    const obtenerUltimoId = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
          params: { sheetName: 'SOLICITUDES4' }, // Cambia 'SOLICITUDES' según la hoja en la que estés trabajando
        });
        const nuevoId = response.data.lastId + 1;
        setIdSolicitud(nuevoId); // Establece el nuevo id_solicitud
      } catch (error) {
        console.error('Error al obtener el último ID:', error);
      }
    };

    if (!idSolicitud) {
      obtenerUltimoId();
    }
  }, [idSolicitud]);

  const handleNext = async () => {
    const hoja = 4; // Formulario 2 va en SOLICITUDES

    const completarValoresConNo = (data) => {
      const completado = {};
      for (let key in data) {
        completado[key] = data[key] === '' || data[key] === null || data[key] === undefined ? 'No' : data[key];
      }
      return completado;
    };
    
    // Definir los datos específicos según el paso actual
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
    console.log('Datos enviados al backend:', pasoDataCompleto); // Agrega este log para verificar los datos

    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID de la solicitud
        formData: pasoDataCompleto, // Datos específicos del paso actual
        paso: activeStep + 1, // Paso actual
        hoja, // Indica qué hoja se está usando
        userData: {
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
  
      // Mover al siguiente paso
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setCurrentSection(5); // Cambia a FormSection (Formulario Aprobación)
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
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

    // Datos del último paso (Paso 5)
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
      // Guardar los datos del último paso en Google Sheets
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
  
      // Después de guardar los datos, cambia de sección
      setCurrentSection(5); // Cambia a FormSection (Formulario Aprobación)
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 1:
        return <Step2FormSection4 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3FormSection4 formData={formData} handleInputChange={handleInputChange}/>;
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
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={index} sx={{marginBottom:'20px'}}>
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
    </Box>
  );
}

export default FormSection4;

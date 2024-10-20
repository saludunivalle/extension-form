import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography } from '@mui/material';
import Step1 from './Step1'; // Importamos los componentes de cada paso
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import axios from 'axios'; // Importa Axios para realizar la solicitud de guardado

function FormSection({ formData, handleInputChange, setCurrentSection, escuelas, departamentos, secciones, programas, oficinas, userData }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Datos Generales',
    'Detalles de la Actividad',
    'Certificación y Evaluación',
    'Información Coordinador',
    'Información Adicional',
  ];
 
  const [idSolicitud, setIdSolicitud] = useState(null); // Para almacenar el id_solicitud
  const id_usuario = userData?.id_usuario;

  useEffect(() => {
    const obtenerUltimoId = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
          params: { sheetName: 'SOLICITUDES2' }, // Cambia 'SOLICITUDES' según la hoja en la que estés trabajando
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
    const hoja = 2; // Formulario 2 va en SOLICITUDES
    console.log("FormData antes de enviar:", formData); // Verifica el formData completo antes de enviar
    // Definir los datos específicos según el paso actual
    let pasoData = {};
    
    switch (activeStep) {
      case 0:
        pasoData = {
          fecha_solicitud: formData.fecha_solicitud || '',  // Si está vacío, asigna cadena vacía
          nombre_actividad: formData.nombre_actividad || '',
          nombre_solicitante: formData.nombre_solicitante || '',
          dependencia_tipo: formData.dependencia_tipo || '',
          nombre_escuela: formData.nombre_escuela || '',
          nombre_departamento: formData.nombre_departamento || '',
          nombre_seccion: formData.nombre_seccion || '',
          nombre_dependencia: formData.nombre_dependencia || '',
        };
        break;
      case 1:
        pasoData = {
          tipo: formData.tipo || '',
          otro_tipo: formData.otro_tipo || '',
          modalidad: formData.modalidad || '',
        };
        break;
      case 2:
        pasoData = {
          horas_trabajo_presencial: formData.horas_trabajo_presencial || '',
          horas_sincronicas: formData.horas_sincronicas || '',
          total_horas: formData.total_horas || '',
          programCont: formData.programCont || '',
          dirigidoa: formData.dirigidoa || '',
          creditos: formData.creditos || '',
          cupo_min: formData.cupo_min || '',
          cupo_max: formData.cupo_max || '',
        };
        break;
      case 3:
        pasoData = {
          nombre_coordinador: formData.nombre_coordinador || '',
          correo_coordinador: formData.correo_coordinador || '',
          tel_coordinador: formData.tel_coordinador || '',
          perfil_competencia: formData.perfil_competencia || '',
          formas_evaluacion: formData.formas_evaluacion || '',
          certificado_solicitado: formData.certificado_solicitado || '',
          calificacion_minima: formData.calificacion_minima || '',
          razon_no_certificado: formData.razon_no_certificado || '',
          valor_inscripcion: formData.valor_inscripcion || '',
        };
        break;
      case 4:
        pasoData = {
          becas_convenio: formData.becas_convenio || '',
          becas_estudiantes: formData.becas_estudiantes || '',
          becas_docentes: formData.becas_docentes || '',
          becas_egresados: formData.becas_egresados || '',
          becas_funcionarios: formData.becas_funcionarios || '',
          becas_otros: formData.becas_otros || '',
          periodicidad_oferta: formData.periodicidad_oferta || '',
          organizacion_actividad: formData.organizacion_actividad || '',
          otro_tipo_act: formData.otro_tipo_act || '',
        };
        break;
      default:
        break;
    }
  
    try {
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID de la solicitud
        formData: pasoData, // Datos específicos del paso actual
        paso: activeStep + 1, // Paso actual
        hoja, // Indica qué hoja se está usando
        userData: {
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
  
      // Mover al siguiente paso
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error) {
      console.error('Error al guardar el progreso:', error);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    const hoja = 2; // Cambia este valor según la hoja a la que corresponda el formulario
    
    // Datos del último paso (Paso 5)
    const pasoData = {
      becas_convenio: formData.becas_convenio || '',
      becas_estudiantes: formData.becas_estudiantes || '',
      becas_docentes: formData.becas_docentes || '',
      becas_egresados: formData.becas_egresados || '',
      becas_funcionarios: formData.becas_funcionarios || '',
      becas_otros: formData.becas_otros || '',
      periodicidad_oferta: formData.periodicidad_oferta || '',
      organizacion_actividad: formData.organizacion_actividad || '',
      otro_tipo_act: formData.otro_tipo_act || '',
    };
  
    try {
      // Guardar los datos del último paso en Google Sheets
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud, // El ID único de la solicitud
        formData: pasoData, // Datos del último paso (Paso 5)
        paso: 5, // El número del último paso
        hoja, // Indica qué hoja se está usando
        userData: {
          id_usuario, // Enviar el id_usuario
          name: userData.name, // Enviar el nombre del usuario
        }
      });
  
      // Después de guardar los datos, cambia de sección
      setCurrentSection(3); // Cambia a FormSection (Formulario Aprobación)
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
      console.error('Detalles del error:', error.response?.data); // Mostrar detalles del error si existen
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            escuelas={escuelas}
            departamentos={departamentos}
            secciones={secciones}
            programas={programas}
            oficinas={oficinas}
          />
        );
      case 1:
        return <Step2 formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <Step3 formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step4 formData={formData} handleInputChange={handleInputChange} />;
      case 4:
        return <Step5 formData={formData} handleInputChange={handleInputChange} />;
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

export default FormSection;

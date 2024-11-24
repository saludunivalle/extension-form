import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import Step1 from './Step1'; // Importamos los componentes de cada paso
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FormSection({ 
  formData, 
  handleInputChange, 
  setCurrentSection, 
  escuelas, 
  departamentos, 
  secciones, 
  programas, 
  oficinas, 
  userData, 
  currentStep 
}) {
  const [activeStep, setActiveStep] = useState(currentStep); // Usar currentStep como el paso inicial
  const [idSolicitud, setIdSolicitud] = useState(localStorage.getItem('id_solicitud')); // Usar id_solicitud desde el localStorage
  const [showModal, setShowModal] = useState(false); // Estado para el modal de finalización
  const navigate = useNavigate();


  useEffect(() => {
    if (!idSolicitud) {
      alert('No se encontró un ID válido para esta solicitud. Por favor, vuelve al dashboard.');
      navigate('/');
    }
  }, [idSolicitud, navigate]);

  const steps = [
    'Datos Generales',
    'Detalles de la Actividad',
    'Certificación y Evaluación',
    'Información Coordinador',
    'Información Adicional',
  ];

  // Manejar paso siguiente
  const handleNext = async () => {
    const hoja = 1; // Cambiar según corresponda al formulario actual
    let pasoData = {};

    // Configurar los datos según el paso actual
    switch (activeStep) {
      case 0:
        pasoData = {
          id_solicitud: idSolicitud,
          fecha_solicitud: formData.fecha_solicitud || '',
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
          introduccion: formData.introduccion,
          objetivo_general: formData.objetivo_general,
          objetivos_especificos: formData.objetivos_especificos,
          justificacion: formData.justificacion,
          metodologia: formData.metodologia,
        };
        break;
      case 2:
        pasoData = {
          tipo: formData.tipo || '',
          otro_tipo: formData.otro_tipo || '',
          modalidad: formData.modalidad || '',
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
      // Guardar los datos del paso actual en el backend
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoData,
        paso: activeStep + 1,
        hoja,
        userData: {
          id_usuario: userData.id,
          name: userData.name,
        },
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
    const hoja = 1; // Cambiar según corresponda al formulario actual
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
      // Guardar los datos del último paso
      await axios.post('https://siac-extension-server.vercel.app/guardarProgreso', {
        id_solicitud: idSolicitud,
        formData: pasoData,
        paso: 5,
        hoja,
        userData: {
          id_usuario: userData.id,
          name: userData.name,
        },
      });

      setShowModal(true); // Mostrar modal de finalización
    } catch (error) {
      console.error('Error al guardar los datos del último paso:', error);
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
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}
        </Button>
      </Box>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Formulario Finalizado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sus datos han sido guardados correctamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurrentSection(2)} color="primary">
            Continuar
          </Button>
          <Button onClick={() => window.location.href = '/'} color="secondary">
            Salir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FormSection;

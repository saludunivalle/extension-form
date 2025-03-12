import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText, CircularProgress, Tooltip } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

const sectionTitles = [
  'Aprobación - Formulario F-05-MP-05-01-01',
  'Presupuesto - Formulario F-06-MP-05-01-01',
  'Riesgos Potenciales - Formulario F-08-MP-05-01-01',
  'Identificación de Mercadeo - Formulario F-07-MP-05-01-01'
];

function Dashboard({ userData }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState({});
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#9c27b0',
      },
      default: {
        main: '#e0e0e0',
      },
    },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const activeResponse = await axios.get(
          'https://siac-extension-server.vercel.app/getActiveRequests', // Sin /api/
          { params: { userId: userData.id } } // El backend espera "userId" y no "id_usuario"
        );
        setActiveRequests(activeResponse.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setActiveRequests([]);
        } else {
          console.error('Error al obtener solicitudes activas:', error);
        }
      }
      try {
        const completedResponse = await axios.get(
          'https://siac-extension-server.vercel.app/getCompletedRequests',
          { params: { id_usuario: userData.id } }
        );
        setCompletedRequests(completedResponse.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setCompletedRequests([]);
        } else {
          console.error('Error al obtener solicitudes terminadas:', error);
        }
      }
      setLoading(false);
    };
    if (userData && userData.id) {
      fetchRequests();
    }
  }, [userData]);
 
  const handleCreateNewRequest = async () => {
    try {
      console.log('🆕 Solicitando nuevo ID de solicitud...')
            localStorage.removeItem('id_solicitud');
      localStorage.removeItem('formData');
  
      const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
        params: { sheetName: 'SOLICITUDES' }, // Asegurar que esté consultando la hoja correcta
      });
      console.log('Respuesta de getLastId:', response.data);

      if (!response.data || response.status !== 200) {
        throw new Error('Respuesta inesperada del servidor.');
      }
      // Generar un nuevo ID sumando 1 al último ID registrado
      const nuevoId = (response.data.lastId || 0) + 1;
      console.log(`✅ Nuevo ID generado: ${nuevoId}`);
      //  Guardar el nuevo ID en localStorage
      localStorage.setItem('id_solicitud', nuevoId);
  
      //Insertar la nueva fila en Google Sheets para registrar la solicitud
      await axios.post('https://siac-extension-server.vercel.app/createNewRequest', {
        id_solicitud: nuevoId,
        fecha_solicitud: new Date().toISOString().split('T')[0], // Fecha actual
        nombre_actividad: '',
        nombre_solicitante: userData.name, // Nombre del usuario autenticado
        dependencia_tipo: '',
        nombre_dependencia: ''
      });

      console.log(`✅ Nueva solicitud guardada con ID: ${nuevoId}`);
  
      //Redirigir al usuario al formulario de la solicitud creada
      navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`);
    } catch (error) {
      console.error('🚨 Error al generar el ID de la solicitud:', error);
      alert('Hubo un problema al crear la nueva solicitud. Inténtalo de nuevo.');
    }
};

  const handleContinueRequest = async (request) => {
    try {
      console.log(`🔎 Buscando datos actualizados para la solicitud con ID: ${request.idSolicitud}`);
      const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
        params: { id_solicitud: request.idSolicitud }
      });
      
      // Obtener datos de la hoja SOLICITUDES que contiene ETAPAS
      const solicitudData = response.data.SOLICITUDES || response.data;
      
      // Extraer etapa_actual y paso de los datos de SOLICITUDES
      const etapa_actual = solicitudData.etapa_actual || request.formulario;
      const paso = solicitudData.paso || 0;
      
      localStorage.setItem('id_solicitud', solicitudData.id_solicitud);
      localStorage.setItem('formData', JSON.stringify(solicitudData));
      
      navigate(`/formulario/${etapa_actual}?solicitud=${request.idSolicitud}&paso=${paso}`);
    } catch (error) {
      console.error('🚨 Error al continuar la solicitud:', error);
      alert('Hubo un problema al cargar los datos de la solicitud. Inténtalo de nuevo.');
    }
  };
  
  const handleGenerateFormReport = async (request, formNumber) => {
    try {
      const { idSolicitud } = request;

      if (!idSolicitud || !formNumber) {
        alert("No se puede generar el informe porque falta información.");
        return;
      }

      setLoadingReports((prev) => ({ ...prev, [`${idSolicitud}-${formNumber}`]: true }));

      console.log(`📄 Generando reporte para Solicitud ID: ${idSolicitud}, Formulario: ${formNumber}`);

      const response = await axios.post('https://siac-extension-server.vercel.app/generateReport', {
        solicitudId: idSolicitud,
        formNumber,
      });

      if (response.data?.link) {
        console.log(`✅ Reporte generado con éxito: ${response.data.link}`);
        alert(`Informe generado exitosamente para el formulario ${formNumber} - ${sectionTitles[formNumber - 1]}`);
        window.open(response.data.link, '_blank');
      } else {
        throw new Error('No se recibió un enlace de reporte válido.');
      }
    } catch (error) {
      console.error(`Error al generar el informe para el formulario ${formNumber}:`, error);
      alert('Hubo un problema al generar el informe.');
    } finally { 
      setLoadingReports((prev) => ({ ...prev, [`${request.idSolicitud}-${formNumber}`]: false }));
    }
  };

  const getButtonState = (request, formNumber) => {
    // Definir la cantidad máxima de pasos por formulario
    const maxPasosPorFormulario = {
      1: 5,  // Formulario 1 tiene 5 pasos
      2: 3,  // Formulario 2 tiene 3 pasos
      3: 5,  // Formulario 3 tiene 5 pasos
      4: 5   // Formulario 4 tiene 5 pasos
    };
  
    const isCompleted = completedRequests.some(
      (completed) => completed.idSolicitud === request.idSolicitud
    );
  
    // Determinar si el formulario actual está completado
    const isFormCompleted = 
      request.formulario === formNumber && 
      request.paso >= maxPasosPorFormulario[formNumber];
  
    // Determinar si es un formulario anterior ya completado
    const isPastForm = request.formulario > formNumber;
  
    if (isCompleted || isFormCompleted || isPastForm) {
      return { enabled: true, color: 'primary', cursor: 'pointer' };
    }
  
    // Si es el formulario actual pero no está completado
    if (request.formulario === formNumber) {
      return { enabled: false, color: '#90caf9', cursor: 'not-allowed' };
    }
  
    // Formularios futuros
    return { enabled: false, color: '#e0e0e0', cursor: 'not-allowed' };
  };

  if (!userData || !userData.id) {
    return <div>Cargando...</div>;
  }
  
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ padding: '20px', marginTop: '130px', textAlign: 'center' }}>
          <CircularProgress />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: '20px', marginTop: '130px' }}>
        <Typography variant="h5">Bienvenido, {userData.name}</Typography>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
          onClick={handleCreateNewRequest}
        >
          Crear Nueva Solicitud
        </Button>

        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Solicitudes en Creación:
        </Typography>
        <List>
          {activeRequests.map((request) => (
            <ListItem key={request.idSolicitud} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ListItemText primary={request.nombre_actividad || `Solicitud ${request.idSolicitud}`} />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleContinueRequest(request)}
                style={{ marginRight: '15px' }}
              >
                Continuar
              </Button>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map((formNumber) => {
                  const { enabled, color, cursor } = getButtonState(request, formNumber);
                  const isLoading = loadingReports[`${request.idSolicitud}-${formNumber}`];

                  return (
                    <Tooltip
                      key={`${request.idSolicitud}-${formNumber}`}
                      title={
                        enabled
                          ? `Generar ${sectionTitles[formNumber - 1]}`
                          : 'Complete el formulario para generar el reporte'
                      }
                      arrow
                >
                      <span>
                      <Button
                        variant="contained"
                        style={{ backgroundColor: color, cursor, minWidth: '100px' }}
                        onClick={() => enabled && handleGenerateFormReport(request, formNumber)}
                        disabled={!enabled || isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : formNumber}
                      </Button>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Solicitudes Terminadas:
        </Typography>
        <List>
          {completedRequests.map((request) => (
            <ListItem key={request.idSolicitud} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ListItemText primary={request.nombre_actividad || `Solicitud ${request.idSolicitud}`} />
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map((formNumber) => (
                  <Button
                    key={`${request.idSolicitud}-${formNumber}`}
                    variant="contained"
                    color="primary"
                    onClick={() => handleGenerateFormReport(request, formNumber)}
                  >
                    
                    {formNumber}
                  </Button>
                ))}
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </ThemeProvider>
  );
}

Dashboard.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};


Dashboard.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Dashboard;
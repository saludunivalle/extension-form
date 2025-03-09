import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

function Dashboard({ userData }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const { idSolicitud, formulario, paso } = request;
  
    if (!idSolicitud) {
      console.error('Error: idSolicitud es indefinido.');
      alert('Error: No se puede continuar sin un ID de solicitud válido.');
      return;
    }
  
    if (formulario < 1 || formulario > 4) {
      console.error('Formulario inválido:', formulario);
      alert('El número de formulario no es válido.');
      return;
    }
    if (paso < 0) {
      console.error('Paso inválido:', paso);
      alert('El paso del formulario no es válido.');
      return;
    }
  
    try {
      console.log(`🔎 Buscando datos de la solicitud con ID: ${idSolicitud}`);
      
      // Obtener datos actualizados desde Google Sheets
      const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
        params: { id_solicitud: idSolicitud }
      });
  
      if (response.status === 200 && response.data) {
        console.log('✅ Datos de la solicitud obtenidos:', response.data);
        // Extraer los datos correctamente de `SOLICITUDES`
        const solicitudData = response.data.SOLICITUDES || response.data;
  
        if (!solicitudData.id_solicitud) {
          throw new Error("La respuesta no contiene un ID válido.");
        }
        // Guardamos los datos en localStorage para persistencia
        localStorage.setItem('id_solicitud', solicitudData.id_solicitud);
        localStorage.setItem('formData', JSON.stringify(solicitudData));
        // Navegamos al formulario con los datos ya recuperados
        navigate(`/formulario/${formulario}?solicitud=${idSolicitud}&paso=${paso}`);
      } else {
        throw new Error('No se encontraron datos para la solicitud.');
      }
    } catch (error) {
      console.error('🚨 Error al cargar los datos de la solicitud:', error);
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

      console.log(`📄 Generando reporte para Solicitud ID: ${idSolicitud}, Formulario: ${formNumber}`);

      const response = await axios.post('https://siac-extension-server.vercel.app/generateReport', {
        solicitudId: idSolicitud,
        formNumber,
      });

      if (response.data?.link) {
        console.log(`✅ Reporte generado con éxito: ${response.data.link}`);
        alert(`Informe generado exitosamente para el formulario ${formNumber}`);
        window.open(response.data.link, '_blank');
      } else {
        throw new Error('No se recibió un enlace de reporte válido.');
      }
    } catch (error) {
      console.error(`Error al generar el informe para el formulario ${formNumber}:`, error);
      alert('Hubo un problema al generar el informe.');
    }
  };

  const getButtonState = (request, formNumber) => {
    const isCompleted = completedRequests.some((completed) => completed.idSolicitud === request.idSolicitud);
    const isCurrent = formNumber === request.etapa_actual; 
    const isPast = formNumber < request.etapa_actual;
    const isFuture = formNumber > request.etapa_actual;

    if (isCompleted) {
      return { enabled: true, color: 'primary', cursor: 'pointer' };
    } else if (isPast) {
      return { enabled: true, color: 'primary', cursor: 'pointer' }; 
    } else if (isCurrent) {
      return { enabled: false, color: '#90caf9', cursor: 'not-allowed' }; 
    } else if (isFuture) {
      return { enabled: false, color: '#e0e0e0', cursor: 'not-allowed' }; 
    }
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
                style={{ marginRight: '10px' }}
              >
                Continuar
              </Button>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map((formNumber) => {
                  const { enabled, color, cursor } = getButtonState(request, formNumber);
                  return (
                    <Button
                      key={`${request.idSolicitud}-${formNumber}`}
                      variant="contained"
                      style={{ backgroundColor: color, cursor }}
                      onClick={() => enabled && handleGenerateFormReport(request, formNumber)}
                      disabled={!enabled}
                    >
                      {formNumber}
                    </Button>
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
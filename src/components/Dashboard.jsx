import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

function Dashboard({ userData }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
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
    const fetchActiveRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getActiveRequests', {
          params: { userId: userData.id },
        });
        setActiveRequests(response.data);
        console.log('Solicitudes activas:', response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes activas:', error);
      }
    };
  
    const fetchCompletedRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getCompletedRequests', {
          params: { userId: userData.id },
        });
        setCompletedRequests(response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes terminadas:', error);
      }
    };
  
    fetchActiveRequests();
    fetchCompletedRequests();
  }, [userData.id]);  

  const handleContinue = (request) => {
    const { idSolicitud, formulario, paso } = request;
  
    // Validar formulario y paso
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
  
    const pasoCorrecto = paso > 0 ? paso - 1 : 0;
    localStorage.setItem('id_solicitud', idSolicitud);
  
    const formRoute = `/formulario/${formulario}?solicitud=${idSolicitud}&paso=${pasoCorrecto}`;
    navigate(formRoute);
  };
  

  const handleCreateNewRequest = async () => {
    try {
      const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
        params: { sheetName: 'SOLICITUDES2' },
      });

      const nuevoId = response.data.lastId + 1;

      localStorage.removeItem('id_solicitud');
      localStorage.setItem('id_solicitud', nuevoId);

      navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`);
    } catch (error) {
      console.error('Error al generar el ID de la solicitud:', error);
      alert('Hubo un problema al crear la nueva solicitud. Inténtalo de nuevo.');
    }
  };

  const handleGenerateFormReport = async (request, formNumber) => {
    try {
      const { idSolicitud } = request;
  
      console.log("idSolicitud recibido:", idSolicitud);
      console.log("formNumber recibido:", formNumber);
  
      if (!idSolicitud || !formNumber) {
        console.error("Los parámetros solicitudId o formNumber no están definidos");
        alert("No se puede generar el informe porque falta información.");
        return;
      }
  
      const response = await axios.post('https://siac-extension-server.vercel.app/generateReport', {
        solicitudId: idSolicitud,
        formNumber,
      });
  
      const { link } = response.data;
  
      if (link) {
        alert(`Informe generado exitosamente para el formulario ${formNumber}`);
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error(`Error al generar el informe para el formulario ${formNumber}:`, error);
      alert('Hubo un problema al generar el informe.');
    }
  };
  

  const isButtonEnabled = (request, formNumber) => {
    // Si la solicitud está terminada, todos los botones deben estar habilitados
    const isCompleted = completedRequests.some((completed) => completed.idSolicitud === request.idSolicitud);
    
    // Habilita todos los botones para solicitudes terminadas
    if (isCompleted) {
      return true;
    }
  
    // Habilitar solo hasta el formulario actual para solicitudes activas
    return formNumber <= request.formulario;
  };  

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
          Solicitudes en creación:
        </Typography>
        <List>
          {activeRequests.map((request) => (
            <ListItem key={request.idSolicitud} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ListItemText
                primary={request.nombre_actividad || `Solicitud ${request.idSolicitud}`}
              />
              <Button
                variant="outlined"
                onClick={() => handleContinue(request)}
                style={{ marginLeft: '10px', marginRight: '10px' }}
              >
                Continuar
              </Button>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map((buttonNumber) => (
                  <Button
                    key={buttonNumber}
                    variant="contained"
                    color={isButtonEnabled(request, buttonNumber) ? 'primary' : 'default'}
                    onClick={() => isButtonEnabled(request, buttonNumber) && handleGenerateFormReport(request, buttonNumber)}
                    disabled={!isButtonEnabled(request, buttonNumber)}
                  >
                    {buttonNumber}
                  </Button>
                ))}
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
              <ListItemText
                primary={request.nombre_actividad ? request.nombre_actividad : `Solicitud ${request.idSolicitud}`}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map((buttonNumber) => (
                  <Button
                    key={`${request.idSolicitud}-${buttonNumber}`} // Combinar idSolicitud y buttonNumber
                    variant="contained"
                    color="primary"
                    onClick={() => handleGenerateFormReport(request, buttonNumber)}
                  >
                    {buttonNumber}
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

export default Dashboard;

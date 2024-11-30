import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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

    // Restar 1 al paso para asegurarnos de que el usuario llegue al paso correcto
    const pasoCorrecto = paso > 0 ? paso - 1 : 0; // Asegurarse de no tener un valor menor a 0

    // Actualizamos el localStorage con el id de la solicitud que se va a continuar
    console.log("Actualizando el id_solicitud en localStorage con:", idSolicitud);
    localStorage.setItem('id_solicitud', idSolicitud);

    // Navegamos hacia la ruta correcta del formulario
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
    // Habilitar todos los botones hasta el formulario actual
    return formNumber <= request.formulario;
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: '20px', marginTop: '130px' }}>
        <Typography variant="h5">Bienvenido, {userData.name}</Typography>

        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Solicitudes Activas:
        </Typography>
        <List>
          {activeRequests.map((request) => (
            <ListItem key={request.idSolicitud} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ListItemText
                primary={request.nombre_actividad ? request.nombre_actividad : `Solicitud ${request.idSolicitud}`}
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

        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
          onClick={handleCreateNewRequest}
        >
          Crear Nueva Solicitud
        </Button>
      </div>
    </ThemeProvider>
  );
}

export default Dashboard;

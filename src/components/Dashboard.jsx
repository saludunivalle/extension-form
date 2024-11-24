import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard({ userData }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener solicitudes activas
    const fetchActiveRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getActiveRequests', {
          params: { userId: userData.id },
        });
        console.log('usuario:', userData);
        setActiveRequests(response.data); // Guardar solicitudes activas
        console.log('Solicitudes activas:', response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes activas:', error);
      }
    };

    // Obtener solicitudes completadas
    const fetchCompletedRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getCompletedRequests', {
          params: { userId: userData.id },
        });
        setCompletedRequests(response.data); // Guardar solicitudes completadas
        console.log('Solicitudes terminadas:', response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes terminadas:', error);
      }
    };

    // Llamamos ambas funciones para obtener tanto las activas como las completadas
    fetchActiveRequests();
    fetchCompletedRequests();
  }, [userData.id]);

  const handleGenerateReport = async (request) => {
    try {
      const { idSolicitud } = request;
      console.log(`Solicitando informe para la solicitud: ${idSolicitud}`);

      const response = await axios.post('https://siac-extension-server.vercel.app/generateReport', {
        solicitudId: idSolicitud,
      });

      const { links } = response.data;

      if (links && links.length > 0) {
        alert('Informes generados exitosamente. Puedes descargarlos en los siguientes enlaces:');
        links.forEach((link) => window.open(link, '_blank'));
      }
    } catch (error) {
      console.error('Error al generar informes:', error);
      alert('Hubo un problema al generar los informes.');
    }
  };

  const handleContinue = (request) => {
    const { idSolicitud, formulario, paso } = request;

    // Redirigir a la ruta correcta con los parámetros
    const formRoute = `/formulario/${formulario}?solicitud=${idSolicitud}&paso=${paso}`;
    navigate(formRoute);
  };

  const handleCreateNewRequest = async () => {
    try {
      const response = await axios.get('https://siac-extension-server.vercel.app/getLastId', {
        params: { sheetName: 'SOLICITUDES2' }, // Asegúrate de usar la hoja correcta
      });
  
      const nuevoId = response.data.lastId + 1;
  
      // Limpia cualquier estado previo en el localStorage
      localStorage.removeItem('id_solicitud');
  
      // Guarda el nuevo id_solicitud
      localStorage.setItem('id_solicitud', nuevoId);
  
      // Redirige al formulario con el nuevo id_solicitud
      navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`);
    } catch (error) {
      console.error('Error al generar el ID de la solicitud:', error);
      alert('Hubo un problema al crear la nueva solicitud. Inténtalo de nuevo.');
    }
  };
  

  return (
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
            <div>
              <Button
                variant="outlined"
                onClick={() => handleContinue(request)}
                style={{ marginRight: '10px' }}
              >
                Continuar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleGenerateReport(request)}
              >
                Generar Informe
              </Button>
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
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleGenerateReport(request)}
            >
              Generar Informe
            </Button>
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
  );
}

export default Dashboard;

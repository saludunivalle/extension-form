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
          params: { userId: userData.id }
        });
        setActiveRequests(response.data); // Guardar solicitudes activas
        console.log("Solicitudes activas:", response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes activas:', error);
      }
    };

    // Obtener solicitudes completadas
    const fetchCompletedRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getCompletedRequests', {
          params: { userId: userData.id }
        });
        setCompletedRequests(response.data); // Guardar solicitudes completadas
        console.log("Solicitudes terminadas:", response.data);
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

      const { link, links, message } = response.data;

      // Validamos si la respuesta tiene un enlace o varios enlaces
      if (link) {
        alert(`Informe generado exitosamente. Puedes descargarlo aquí: \n\n${link}`);
        window.open(link, '_blank');
      } else if (links && links.length > 0) {
        alert(`Informes generados exitosamente. Puedes descargarlos aquí: \n\n${links.join('\n')}`);
        links.forEach((link) => window.open(link, '_blank'));
      } else {
        throw new Error('No se generaron enlaces de informes en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al generar los informes:', error);
      alert('Hubo un error al generar los informes. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Función para continuar con la solicitud en progreso
  const handleContinue = (request) => {
    const { idSolicitud, formulario, paso } = request;
  
    // Redirigir a la ruta correcta con los parámetros
    let formRoute = `/formulario/${formulario}?solicitud=${idSolicitud}&paso=${paso}`;
    
    navigate(formRoute);
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
            {/* Usamos el nombre de la actividad si existe, si no mostramos "Solicitud {id_solicitud}" */}
            <ListItemText 
              primary={request.nombre_actividad ? request.nombre_actividad : `Solicitud ${request.idSolicitud}`} 
            />
            <div>
              <Button
                variant="outlined"
                onClick={() => handleContinue(request)} // Llamamos a handleContinue con la solicitud activa
                style={{ marginRight: '10px' }}
              >
                Continuar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleGenerateReport(request)} // Nueva función para generar informe
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
              onClick={() => handleGenerateReport(request)} // Misma función para generar informe
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
        onClick={() => navigate('/form')}
      >
        Crear Nueva Solicitud
      </Button>
    </div>
  );
}

export default Dashboard;

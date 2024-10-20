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
          <ListItem key={request.idSolicitud}>
            {/* Usamos el nombre de la actividad si existe, si no mostramos "Solicitud {id_solicitud}" */}
            <ListItemText 
              primary={request.nombre_actividad ? request.nombre_actividad : `Solicitud ${request.idSolicitud}`} 
            />
            <Button
              variant="outlined"
              onClick={() => handleContinue(request)} // Llamamos a handleContinue con la solicitud activa
            >
              Continuar
            </Button>
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Solicitudes Terminadas:
      </Typography>
      <List>
        {completedRequests.map((request) => (
          <ListItem key={request.idSolicitud}>
            <ListItemText 
              primary={request.nombre_actividad ? request.nombre_actividad : `Solicitud ${request.idSolicitud}`} 
            />
            {/* No tocamos las solicitudes terminadas, puedes agregar algo aquí si lo necesitas */}
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

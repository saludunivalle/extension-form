import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard({ userData }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getRequests', {
          params: { userId: userData.id }
        });
        setActiveRequests(response.data.activeRequests);
        setCompletedRequests(response.data.completedRequests);
      } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
      }
    };

    fetchRequests();
  }, [userData.id]);

  return (
    <>
    <div style={{ padding: '20px', marginTop:'130px'}}>
      <Typography variant="h5">Bienvenido, {userData.name}</Typography>
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Solicitudes Activas:
      </Typography>
      <List>
        {activeRequests.map((request) => (
          <ListItem key={request[0]}>
            <ListItemText primary={`Solicitud ${request[0]}`} />
            <Button
              variant="outlined"
              onClick={() => navigate(`/form?solicitud=${request[0]}`)}
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
          <ListItem key={request[0]} button onClick={() => navigate(`/results?solicitud=${request[0]}`)}>
            <ListItemText primary={`Solicitud ${request[0]}`} />
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
    </>
  );
}

export default Dashboard;

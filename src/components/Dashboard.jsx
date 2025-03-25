import { useEffect, useState } from 'react';
import axios from 'axios';
import { openFormReport } from '../services/reportServices';
import { Button, Typography, List, ListItem, ListItemText, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Close, Download, Visibility } from '@mui/icons-material';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReportLink, setSelectedReportLink] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedFormData, setSelectedFormData] = useState({
    idSolicitud: null,
    formNumber: null,
    reportLink: null,
    loading: false,
    error: null
  });

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

  const dialogStyles = {
    paper: {
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
      minWidth: '320px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid #eee'
    },
    content: {
      padding: '24px',
      textAlign: 'center'
    },
    actionButton: {
      margin: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    }
  };

  const [reportLinks, setReportLinks] = useState({
    view: '',
    download: '',
    edit: ''
  });

  const handleOpenDialog = async (request, formNumber) => {
    try {
      // 1. Iniciar estado de carga
      setSelectedFormData({
        idSolicitud: request.idSolicitud,
        formNumber: formNumber,
        reportLink: null,
        loading: true,
        error: null
      });
      
      // 2. Generar reporte primero
      const response = await axios.post(`https://siac-extension-server.vercel.app/generateReport`, {
        solicitudId: request.idSolicitud,
        formNumber
      });
  
      // 3. Si hay enlace, abrir diálogo
      if (response.data?.link) {
        setDialogOpen(true);
        setSelectedFormData(prev => ({
          ...prev,
          reportLink: response.data.link,
          loading: false
        }));
      }
      
    } catch (error) {
      setSelectedFormData(prev => ({
        ...prev,
        loading: false,
        error: 'Error generando reporte'
      }));
    }
  };
  
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReportLink('');
    setSelectedRequest(null); // Limpiar el request seleccionado
  };
  
  const handleOpenReport = () => {
    if (selectedFormData.reportLink && selectedFormData.reportLink !== '') {
      window.open(selectedFormData.reportLink, '_blank');
      handleCloseDialog();
    } else {
      alert('No se encontró el enlace del reporte.');
    }
  };
  
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Obtener solicitudes activas
        const activeResponse = await axios.get(
          'https://siac-extension-server.vercel.app/getActiveRequests',
          { params: { userId: userData.id } }
        );

        
        const requests = activeResponse.data;
        
        // Asignar etapa_actual desde formulario
        const requestsWithStages = requests.map((request) => ({
          ...request,
          etapa_actual: Number(request.formulario) || 0,
        }));
        
        setActiveRequests(requestsWithStages);
        console.log("Solicitudes con etapas:", requestsWithStages);

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

  useEffect(() => {
    if (activeRequests.length > 0) {
      console.log("Datos de solicitudes activas:", activeRequests);
      console.log("Valores de etapa_actual:", activeRequests.map(r => ({
        id: r.idSolicitud,
        etapa: r.etapa_actual,
        nombre: r.nombre_actividad
      })));
    }
  }, [activeRequests]);
 
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

    console.log(`🔎 Buscando datos de la solicitud con ID: ${idSolicitud}`);
    
    // 1. Obtener datos actualizados desde Google Sheets
    const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
      params: { id_solicitud: idSolicitud }
    });

    if (response.status === 200 && response.data) {
      // 2. Extraer y guardar los datos
      const solicitudData = response.data.SOLICITUDES || response.data;
      
      if (!solicitudData.id_solicitud) {
        throw new Error("La respuesta no contiene un ID válido.");
      }
      
      localStorage.setItem('id_solicitud', solicitudData.id_solicitud);
      localStorage.setItem('formData', JSON.stringify(solicitudData));
      
      // 3. Utilizar el servicio existente
      await openFormReport(idSolicitud, formNumber);
    } else {
      throw new Error('No se encontraron datos para la solicitud.');
    }
  } catch (error) {
    console.error('🚨 Error al generar el reporte del formulario:', error);
    alert('Hubo un problema al generar el reporte. Inténtalo de nuevo.');
  }
};


const handleNavigateToForm = async (request, formNumber) => {
  try {
    const { idSolicitud } = request;
    
    // Limpiar localStorage antes de la navegación
    localStorage.removeItem('formData');
    localStorage.setItem('id_solicitud', idSolicitud);
    
    // Obtener datos actualizados de la solicitud
    console.log(`🔎 Cargando datos para solicitud ${idSolicitud}, formulario ${formNumber}`);
    const response = await axios.get('https://siac-extension-server.vercel.app/getSolicitud', {
      params: { id_solicitud: idSolicitud }
    });
    
    if (response.status === 200 && response.data) {
      // Guardar los datos actualizados en localStorage
      const solicitudData = response.data.SOLICITUDES || response.data;
      localStorage.setItem('formData', JSON.stringify(solicitudData));
      console.log(`✅ Datos cargados correctamente para solicitud ${idSolicitud}`);
      
      // Navegar al formulario
      navigate(`/formulario/${formNumber}?solicitud=${idSolicitud}&paso=0`);
    } else {
      throw new Error('No se encontraron datos para esta solicitud');
    }
  } catch (error) {
    console.error('Error al cargar los datos de la solicitud:', error);
    alert('Hubo un problema al cargar los datos de la solicitud seleccionada.');
  }
};
 
  const formNames = [
    "Datos básicos", 
    "Presupuesto", 
    "Matriz de riesgos", 
    "Mercadeo"
  ];

  const getButtonState = (request, formNumber) => {
    const currentStage = Number(request.etapa_actual) || 0;
    
    const isCompleted = completedRequests.some(
      (completed) => completed.idSolicitud === request.idSolicitud
    );
    
    const isPast = formNumber < currentStage;
    const isCurrent = formNumber === currentStage;
    const isFuture = formNumber > currentStage;
  
    console.log(`Solicitud ${request.idSolicitud}, Formulario ${formNumber}:`, { 
      currentStage, isCompleted, isPast, isCurrent, isFuture 
    });
  
    if (isCompleted) {
      return { enabled: true, color: '#1976d2', cursor: 'pointer', progress: 100 };
    } else if (isPast) {
      return { enabled: true, color: '#1976d2', cursor: 'pointer', progress: 100 };
    } else if (isCurrent) {
      // La etapa en progreso debe estar deshabilitada pero con color distintivo
      return { enabled: false, color: '#90caf9', cursor: 'not-allowed', progress: 50 };
    } else {
      // Etapas futuras deshabilitadas
      return { enabled: false, color: '#e0e0e0', cursor: 'not-allowed', progress: 0 };
    }

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

        {/* Solicitudes en Creación */}
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Solicitudes en Creación:
        </Typography>
        {activeRequests.length > 0 && (
          <div style={{ 
            display: 'flex', 
            marginTop: '10px',
            marginLeft: '42%', // Alineamos con los botones de las solicitudes
          }}>
            <div style={{ width: '80px' }}></div> {/* Espacio para el botón "Continuar" */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {formNames.map((name, index) => (
                <div key={`form-name-${index}`} style={{ 
                  width: '100px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#1976d2' 
                }}>
                  <Typography 
                    variant="body2" 
                    align="center"
                    style={{
                      fontSize: '0.75rem',       // Texto más pequeño
                      whiteSpace: 'nowrap',      // Fuerza una sola línea
                      overflow: 'hidden',        // Oculta el desbordamiento
                      textOverflow: 'ellipsis',  // Muestra puntos suspensivos si es necesario
                    }}
                    title={name}  // Muestra el nombre completo al pasar el mouse
                  >
                    {name}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  const { enabled, color } = getButtonState(request, formNumber);
                  const buttonStyles = {
                    backgroundColor: color,
                    cursor: enabled ? 'pointer' : 'not-allowed',
                  };
                  return (
                    <div key={`container-${request.idSolicitud}-${formNumber}`} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      width: '100px' 
                    }}>
                      <Button
                        key={`${request.idSolicitud}-${formNumber}`}
                        variant="contained"
                        style={buttonStyles}
                        onClick={() => handleNavigateToForm(request, formNumber)}
                        disabled={!enabled}
                      >
                        {formNumber}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ListItem>
          ))}
        </List>
        {/* Solicitudes Terminadas */}
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Solicitudes Terminadas:
        </Typography>
        <List>
        {completedRequests.map((request) => (
          <ListItem key={request.idSolicitud} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText primary={request.nombre_actividad || `Solicitud ${request.idSolicitud}`} />
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4].map((formNumber) => {
                const index = formNumber - 1; // Ajustar índice para el array
                
                return (
                  <div key={`container-${request.idSolicitud}-${formNumber}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <Typography 
                      variant="caption" 
                      align="center" 
                      style={{ 
                        color: '#1976d2',
                        fontWeight: 'bold',
                        width: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {formNames[index]}
                    </Typography>
                    <Button
                      key={`${request.idSolicitud}-${formNumber}`}
                      variant="contained"
                      style={{ backgroundColor: '#1976d2' }}
                      onClick={() => handleNavigateToForm(request, formNumber)}
                    >
                      {formNumber}
                    </Button>
                  </div>
                );
              })}
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
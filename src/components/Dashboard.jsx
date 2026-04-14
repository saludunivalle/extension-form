import { useEffect, useState } from 'react';
import axios from 'axios';
import { downloadFormReport } from '../services/reportServices';
import { Button, Typography, List, ListItem, ListItemText, CircularProgress, Tooltip, Checkbox } from '@mui/material';
import {config} from '../config';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Print } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import { sendFormsToRevision } from '../services/revisionService';
const API_URL = config.API_URL;

const flattenSolicitudResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const rootFields = {};
  const nestedFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(nestedFields, value);
    } else {
      rootFields[key] = value;
    }
  });

  return Object.keys(nestedFields).length > 0 ? { ...rootFields, ...nestedFields } : data;
};

const parseEstadoFormularios = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
};

const getLegacyEstadoValue = (source, formNumber) => {
  if (!source || typeof source !== 'object') return '';

  return (
    source[`estado_formulario_${formNumber}`]
    || source[`estado_formulario${formNumber}`]
    || source[`estadoFormulario_${formNumber}`]
    || source[`estadoFormulario${formNumber}`]
    || ''
  );
};

const extractEstadoFormularios = (request) => {
  const estados = {
    ...parseEstadoFormularios(
      request?.estadoFormularios
      || request?.estado_formularios
      || request?.SOLICITUDES?.estadoFormularios
      || request?.SOLICITUDES?.estado_formularios
    ),
  };

  for (let formNumber = 1; formNumber <= 4; formNumber += 1) {
    const legacyState =
      getLegacyEstadoValue(request, formNumber)
      || getLegacyEstadoValue(request?.SOLICITUDES, formNumber);

    if (legacyState && !estados[String(formNumber)]) {
      estados[String(formNumber)] = legacyState;
    }
  }

  return estados;
};

const resolveFormStatus = (request, formNumber) => {
  return request?.estadoFormularios?.[String(formNumber)] || getLegacyEstadoValue(request, formNumber) || '';
};

const normalizeStatusForMatch = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

const isCorrectionsStatus = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized.includes('requiere correccion');
};

const hasCorrectionsInRequest = (request) => {
  const estados = request?.estadoFormularios;
  if (!estados || typeof estados !== 'object') {
    return false;
  }

  return Object.values(estados).some((estado) => isCorrectionsStatus(estado));
};

const isLockedForOwner = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized === 'enviado a revision' || normalized === 'aprobado';
};

const normalizeRequest = (request) => {
  if (Array.isArray(request)) {
    const [
      idSolicitud,
      idUsuario,
      fechaSolicitud,
      nombreSolicitante,
      formulario,
      estado,
      nombreActividad,
      paso,
      estadoFormulariosRaw,
    ] = request;

    const estados = parseEstadoFormularios(estadoFormulariosRaw);
    if (formulario && estado && !estados[String(formulario)]) {
      estados[String(formulario)] = estado;
    }

    return {
      idSolicitud: idSolicitud || null,
      id_usuario: idUsuario || null,
      fecha_solicitud: fechaSolicitud || '',
      nombre_solicitante: nombreSolicitante || '',
      formulario: Number(formulario) || 0,
      estado: estado || '',
      nombre_actividad: nombreActividad || '',
      paso: Number(paso) || 0,
      etapa_actual: Number(formulario) || 0,
      estadoFormularios: estados,
    };
  }

  return {
    ...request,
    idSolicitud: request.idSolicitud || request.id_solicitud || request.id || request.solicitud_id,
    id_usuario: request.id_usuario || request.idUsuario || request.userId || request.id_user || request.user_id || request.solicitante_id || request.idSolicitante || request.usuario?.id || request.user?.id || null,
    nombre_actividad: request.nombre_actividad || request.nombreActividad || request.solicitud || request.actividad || request.titulo || '',
    nombre_solicitante: request.nombre_solicitante || request.nombreSolicitante || request.usuario?.name || request.user?.name || '',
    fecha_solicitud: request.fecha_solicitud || request.fechaSolicitud || '',
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
  };
};

const resolveRequestOwnerId = (request) => {
  return request.id_usuario || request.idUsuario || request.userId || request.id_user || request.user_id || request.solicitante_id || request.idSolicitante || request.usuario?.id || request.user?.id || null;
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const isOwnRequest = (request, currentUserId, currentUserName, currentUserEmail) => {
  const ownerId = resolveRequestOwnerId(request);

  if (ownerId) {
    return String(ownerId) === String(currentUserId);
  }

  const requestOwnerName = normalizeText(request.nombre_solicitante || request.nombreSolicitante || request.usuario?.name || request.user?.name);
  const requestOwnerEmail = normalizeText(request.email_solicitante || request.correo_solicitante || request.usuario?.email || request.user?.email);

  if (requestOwnerEmail && normalizeText(currentUserEmail)) {
    return requestOwnerEmail === normalizeText(currentUserEmail);
  }

  if (requestOwnerName && normalizeText(currentUserName)) {
    return requestOwnerName === normalizeText(currentUserName);
  }

  // Si no hay metadatos del propietario, asumir propia para no romper el flujo existente.
  return true;
};

const mergeUniqueRequests = (requests = []) => {
  return requests.filter((request, index, array) =>
    array.findIndex((item) => String(item.idSolicitud) === String(request.idSolicitud)) === index
  );
};

const normalizeRevisionRequest = (request) => {
  return {
    ...request,
    idSolicitud: request.idSolicitud || request.id_solicitud || request.id || request.solicitud_id,
    id_usuario: request.id_usuario || request.idUsuario || request.userId || request.user?.id || request.usuario?.id || null,
    fecha_solicitud: request.fecha_solicitud || request.fechaSolicitud || request.fecha || '',
    nombre_solicitante: request.nombre_solicitante || request.nombreSolicitante || request.name || request.user?.name || request.usuario?.name || '',
    nombre_actividad: request.nombre_actividad || request.nombreActividad || request.solicitud || request.actividad || request.titulo || '',
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
  };
};

function Dashboard({ userData }) {
  const [ownRequests, setOwnRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(userData?.role?.toLowerCase() === 'admin');
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState({});
  const [selectedFormsByRequest, setSelectedFormsByRequest] = useState({});
  const [bulkReviewLoadingByRequest, setBulkReviewLoadingByRequest] = useState({});
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
        const requestsResponse = await axios.get(`${API_URL}/getRequests`, {
          params: { userId: userData.id }
        });
        console.log('Respuesta de /getRequests:', requestsResponse.data);

        const roleFromApi = requestsResponse.data.role || '';
        const adminFromApi = Boolean(requestsResponse.data?.isAdmin);
        const adminByRole = String(roleFromApi).toLowerCase() === 'admin' || String(userData?.role || '').toLowerCase() === 'admin';
        const adminUser = adminFromApi || adminByRole;

        const activeRequestsData = Array.isArray(requestsResponse.data?.activeRequests)
          ? requestsResponse.data.activeRequests
          : [];
        const completedRequestsData = Array.isArray(requestsResponse.data?.completedRequests)
          ? requestsResponse.data.completedRequests
          : [];

        const normalizedActive = activeRequestsData.map(normalizeRequest);
        const normalizedCompleted = completedRequestsData.map(normalizeRequest);
        const mergedRequests = mergeUniqueRequests([...normalizedActive, ...normalizedCompleted]).filter((request) => Boolean(request.idSolicitud));

        if (adminUser) {
          const own = mergedRequests.filter((request) => isOwnRequest(request, userData.id, userData.name, userData.email));
          const correctionsFromOthers = mergedRequests.filter((request) => (
            !isOwnRequest(request, userData.id, userData.name, userData.email) && hasCorrectionsInRequest(request)
          ));

          setOwnRequests(own);

          try {
            const revisionResponse = await axios.get(`${API_URL}/admin/solicitudesRevision`, {
              params: { userId: userData.id }
            });

            const revisionData = Array.isArray(revisionResponse.data?.data)
              ? revisionResponse.data.data
              : [];
            console.log('Solicitudes en revisión para admin:', revisionData);

            const normalizedRevisionRequests = revisionData
              .map(normalizeRevisionRequest)
              .filter((request) => Boolean(request.idSolicitud));

            setReceivedRequests(mergeUniqueRequests([
              ...normalizedRevisionRequests,
              ...correctionsFromOthers,
            ]));
          } catch (revisionError) {
            console.error('Error al obtener solicitudes en revision para admin:', revisionError);
            setReceivedRequests(correctionsFromOthers);
          }
        } else {
          setOwnRequests(mergedRequests);
          setReceivedRequests([]);
        }

        setIsAdmin(adminUser);
        console.log('Solicitudes cargadas desde /getRequests:', mergedRequests);

      } catch (error) {
        // Fallback para mantener compatibilidad con los endpoints actuales.
        try {
          const activeResponse = await axios.get(
            `${API_URL}/getActiveRequests`,
            { params: { userId: userData.id } }
          );

          const activeRequests = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          const requestsWithStages = activeRequests.map(normalizeRequest);

          let mergedRequests = [...requestsWithStages];

          try {
            const completedResponse = await axios.get(
              `${API_URL}/getCompletedRequests`,
              { params: { userId: userData.id } }
            );

            const fullyCompletedRequests = Array.isArray(completedResponse.data) ? completedResponse.data : [];
            const fullyCompletedRequestsWithStages = fullyCompletedRequests.map(normalizeRequest);

            const allCompleted = requestsWithStages.filter((request) => {
              if (!request.estadoFormularios) return false;
              return Object.values(request.estadoFormularios).every((estado) => estado === 'Completado');
            });

            mergedRequests = mergeUniqueRequests([
              ...requestsWithStages,
              ...fullyCompletedRequestsWithStages,
              ...allCompleted,
            ]);
          } catch (completedError) {
            if (completedError.response?.status !== 404) {
              console.error('Error al obtener solicitudes completadas:', completedError);
            }
          }

          const isAdminFallback = String(userData?.role || '').toLowerCase() === 'admin';
          const validRequests = mergedRequests.filter((request) => Boolean(request.idSolicitud));

          setIsAdmin(isAdminFallback);

          if (isAdminFallback) {
            const own = validRequests.filter((request) => isOwnRequest(request, userData.id, userData.name, userData.email));
            const correctionsFromOthers = validRequests.filter((request) => (
              !isOwnRequest(request, userData.id, userData.name, userData.email) && hasCorrectionsInRequest(request)
            ));

            setOwnRequests(own);
            setReceivedRequests(correctionsFromOthers);
          } else {
            setOwnRequests(validRequests);
            setReceivedRequests([]);
          }

          console.log('Solicitudes cargadas desde fallback:', mergedRequests);
        } catch (fallbackError) {
          console.error('Error al obtener solicitudes:', error);
          console.error('Error en fallback de solicitudes:', fallbackError);
          setOwnRequests([]);
          setReceivedRequests([]);
        }
      }
      setLoading(false);
    };
    if (userData && userData.id) {
      fetchRequests();
    }
  }, [userData]);

  useEffect(() => {
    if (ownRequests.length > 0) {
      console.log('Mis solicitudes:', ownRequests.map((request) => ({
        id: request.idSolicitud,
        etapa: request.etapa_actual,
        nombre: request.nombre_actividad
      })));
    }
  }, [ownRequests]);
 
  const handleCreateNewRequest = async () => {
    try {
      console.log('🆕 Solicitando nuevo ID de solicitud...')
            localStorage.removeItem('id_solicitud');
      localStorage.removeItem('formData');
  
      const response = await axios.get(`${API_URL}/getLastId`, {
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
      await axios.post(`${API_URL}/createNewRequest`, {
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

const handleNavigateToForm = async (request, formNumber, readOnly = false) => {
  try {
    const { idSolicitud } = request;
    
    // Limpiar localStorage antes de la navegación
    localStorage.removeItem('formData');
    localStorage.setItem('id_solicitud', idSolicitud);
    
    // Obtener datos actualizados de la solicitud
    console.log(`🔎 Cargando datos para solicitud ${idSolicitud}, formulario ${formNumber}`);
    const response = await axios.get(`${API_URL}/getSolicitud`, {
      params: { id_solicitud: idSolicitud }
    });
    
    if (response.status === 200 && response.data) {
      // Guardar los datos actualizados en localStorage
      const solicitudData = flattenSolicitudResponse(response.data);
      const solicitudMeta = response.data?.SOLICITUDES || solicitudData;
      const etapaActual = Number(solicitudMeta?.etapa_actual || 0);
      const pasoActual = Number(solicitudMeta?.paso || 0);
      const pasoDestino = formNumber === etapaActual ? pasoActual : 0;
      localStorage.setItem('formData', JSON.stringify(solicitudData));
      console.log(`✅ Datos cargados correctamente para solicitud ${idSolicitud}`);
      
      // Navegar al formulario
      navigate(`/formulario/${formNumber}?solicitud=${idSolicitud}&paso=${pasoDestino}${readOnly ? '&readOnly=1' : ''}`);
    } else {
      throw new Error('No se encontraron datos para esta solicitud');
    }
  } catch (error) {
    console.error('Error al cargar los datos de la solicitud:', error);
    alert('Hubo un problema al cargar los datos de la solicitud seleccionada.');
  }
};
 
  const formNames = [
    "Aprobación", 
    "Presupuesto", 
    "Matriz de riesgos", 
    "Mercadeo"
  ];

  const getButtonState = (request, formNumber, { isReceived = false } = {}) => {
    const currentStage = Number(request.etapa_actual) || 0;
    const currentForm = formNumber === currentStage;
    
    // Verificar el estado específico de este formulario
    const formStatus = resolveFormStatus(request, formNumber) || 'En progreso';
    const normalizedStatus = normalizeStatusForMatch(formStatus);
    const isThisFormCompleted = normalizedStatus === "completado" || normalizedStatus === "Completado";
    const isApproved = normalizedStatus === 'aprobado';
    const isInReview = normalizedStatus === 'enviado a revision';
    const isCorrections = isCorrectionsStatus(formStatus);
    const isInProgress = normalizedStatus === 'en progreso';

    const blockedForOwner = !isAdmin && !isReceived && isLockedForOwner(formStatus);

    if (isApproved) {
      return {
        formEnabled: !blockedForOwner,
        reportEnabled: true,
        formColor: '#2e7d32',
        reportColor: '#f0611a',
        cursor: blockedForOwner ? 'not-allowed' : 'pointer',
        progress: 100
      };
    }

    if (isInReview) {
      return {
        formEnabled: isAdmin || isReceived,
        reportEnabled: false,
        formColor: '#f9a825',
        reportColor: '#e0e0e0',
        cursor: (isAdmin || isReceived) ? 'pointer' : 'not-allowed',
        progress: 100
      };
    }

    if (isCorrections) {
      return {
        formEnabled: true,
        reportEnabled: false,
        formColor: '#ef6c00',
        reportColor: '#e0e0e0',
        cursor: 'pointer',
        progress: 100
      };
    }

    if (isInProgress) {
      return {
        formEnabled: true,
        reportEnabled: false,
        formColor: '#90caf9',
        reportColor: '#e0e0e0',
        cursor: 'pointer',
        progress: 50,
      };
    }
    
    const isCurrentFormComplete = isFormCompleted(request, formNumber);
    const isPast = formNumber < currentStage;
    const isCompleted = isFormCompleted(request, formNumber) || isThisFormCompleted;
  
    // Lógica para solicitudes en creación
    if (isCurrentFormComplete || isPast || isThisFormCompleted) {
      return { 
        formEnabled: true, 
        reportEnabled: isCompleted,
        formColor: '#1976d2', 
        reportColor: isCompleted ? '#f0611a' : '#e0e0e0',
        cursor: 'pointer', 
        progress: 100 
      };
    } else if (currentForm) {
      // Permitir continuar desde el boton del formulario en curso.
      return { 
        formEnabled: true, 
        reportEnabled: false,
        formColor: '#90caf9', 
        reportColor: '#e0e0e0',
        cursor: 'pointer', 
        progress: 50 
      };
    } else {
      const allowDirectFormAccess = !isReceived;

      // Permitir acceso directo por boton de formulario cuando es solicitud propia.
      return { 
        formEnabled: allowDirectFormAccess,
        reportEnabled: false,
        formColor: allowDirectFormAccess ? '#bcd7f6' : '#e0e0e0',
        reportColor: '#e0e0e0',
        cursor: allowDirectFormAccess ? 'pointer' : 'not-allowed',
        progress: allowDirectFormAccess ? 10 : 0,
      };
    }
  };

  function isFormCompleted(request, formNumber) {
    const normalizedStatus = normalizeStatusForMatch(resolveFormStatus(request, formNumber));
    if (normalizedStatus === 'completado' || normalizedStatus === 'aprobado') {
      return true;
    }

    // 1. Verificar primero si está marcado explícitamente como completado
    if (request[`estado_formulario_${formNumber}`] === "Completado") {
      return true;
    }
    
    // 2. Obtener el formulario actual que está trabajando el usuario
    const currentFormNumber = Number(request.etapa_actual) || 0;
    
    // 3. Si es un formulario pasado (ya completado), debe estar disponible para reporte
    if (formNumber < currentFormNumber) {
      return true;
    }
    
    // 4. Si es el formulario actual, verificar si ha alcanzado el máximo de pasos
    if (formNumber === currentFormNumber) {
      const maxSteps = {1: 5, 2: 3, 3: 5, 4: 5};
      return request.paso >= maxSteps[formNumber];
    }
    
    // 5. Los formularios futuros nunca están completos excepto si están explícitamente marcados
    return false;
  }

  const handleDownloadFormReport = async (request, formNumber) => {
    const key = `${request.idSolicitud}-${formNumber}`;
    setLoadingReports(prev => ({ ...prev, [key]: true }));
    try {
      const { idSolicitud } = request;
      if (!idSolicitud || !formNumber) {
        alert("No se puede descargar el informe porque falta información.");
        setLoadingReports(prev => ({ ...prev, [key]: false }));
        return;
      }
      await downloadFormReport(idSolicitud, formNumber);
    } catch (error) {
      alert('Hubo un problema al descargar el reporte. Inténtalo de nuevo.');
      console.error('Error al descargar el reporte:', error);
    } finally {
      setLoadingReports(prev => ({ ...prev, [key]: false }));
    }
  };

  const getRequestTotalHours = async (request) => {
    const directHours = Number(request?.total_horas ?? request?.totalHoras ?? request?.SOLICITUDES?.total_horas);
    if (!Number.isNaN(directHours) && directHours > 0) {
      return directHours;
    }

    try {
      const response = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: request.idSolicitud }
      });
      const solicitudData = flattenSolicitudResponse(response.data);
      const fetchedHours = Number(solicitudData?.total_horas ?? solicitudData?.totalHoras);
      return Number.isNaN(fetchedHours) ? 0 : fetchedHours;
    } catch (error) {
      console.warn('No fue posible obtener total_horas para validacion de revision:', error);
      return 0;
    }
  };

  const isFormSelectableForReview = (request, formNumber) => {
    const formStatus = resolveFormStatus(request, formNumber);
    const normalized = normalizeStatusForMatch(formStatus);
    if (normalized === 'aprobado' || normalized === 'enviado a revision') {
      return false;
    }

    if (isCorrectionsStatus(formStatus)) {
      return true;
    }

    return isFormCompleted(request, formNumber) || normalized === 'completado';
  };

  const toggleFormSelection = (requestId, formNumber) => {
    setSelectedFormsByRequest((prev) => {
      const currentRequestSelection = prev[requestId] || {};
      return {
        ...prev,
        [requestId]: {
          ...currentRequestSelection,
          [formNumber]: !currentRequestSelection[formNumber],
        },
      };
    });
  };

  const handleSendSelectedFormsToReview = async (request) => {
    const requestId = request.idSolicitud;
    const selectedMap = selectedFormsByRequest[requestId] || {};
    const selectedForms = Object.entries(selectedMap)
      .filter(([formNumber, isSelected]) => {
        if (!isSelected) return false;
        return isFormSelectableForReview(request, Number(formNumber));
      })
      .map(([formNumber]) => Number(formNumber));

    if (selectedForms.length === 0) {
      alert('Seleccione al menos un formulario para enviar a revision.');
      return;
    }

    const normalizedStatus1 = normalizeStatusForMatch(resolveFormStatus(request, 1));
    const normalizedStatus2 = normalizeStatusForMatch(resolveFormStatus(request, 2));
    const normalizedStatus3 = normalizeStatusForMatch(resolveFormStatus(request, 3));

    const isAlreadySatisfied = (normalizedStatus) => (
      normalizedStatus === 'aprobado' || normalizedStatus === 'enviado a revision'
    );

    const form1Satisfied = selectedForms.includes(1) || isAlreadySatisfied(normalizedStatus1);
    const form2Satisfied = selectedForms.includes(2) || isAlreadySatisfied(normalizedStatus2);

    if (!form1Satisfied || !form2Satisfied) {
      if (!form1Satisfied && !form2Satisfied) {
        alert('Para enviar a revision debe incluir los formularios 1 y 2, salvo que ya esten aprobados o enviados a revision.');
      } else if (!form1Satisfied) {
        alert('Para enviar a revision debe incluir el formulario 1, salvo que ya este aprobado o enviado a revision.');
      } else {
        alert('Para enviar a revision debe incluir el formulario 2, salvo que ya este aprobado o enviado a revision.');
      }
      return;
    }

    const totalHoras = await getRequestTotalHours(request);
    const form3Satisfied = selectedForms.includes(3) || isAlreadySatisfied(normalizedStatus3);
    if (totalHoras >= 16 && !form3Satisfied) {
      alert('Como el total de horas de la actividad es mayor o igual a 16, el formulario 3 es obligatorio para enviar a revision.');
      return;
    }

    setBulkReviewLoadingByRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await sendFormsToRevision({
        id_solicitud: requestId,
        userId: userData.id,
        formularios: selectedForms,
      });

      if (response?.success) {
        setOwnRequests((prev) => prev.map((item) => {
          if (String(item.idSolicitud) !== String(requestId)) {
            return item;
          }

          const nextStatuses = { ...(item.estadoFormularios || {}) };
          selectedForms.forEach((formNumber) => {
            nextStatuses[String(formNumber)] = 'Enviado a revision';
          });

          return {
            ...item,
            estadoFormularios: nextStatuses,
          };
        }));

        setSelectedFormsByRequest((prev) => ({ ...prev, [requestId]: {} }));
        alert('Formularios seleccionados enviados a revision correctamente.');
      }
    } catch (error) {
      console.error('Error al enviar formularios seleccionados a revision:', error);
      alert(error?.response?.data?.message || 'No se pudieron enviar los formularios seleccionados a revision.');
    } finally {
      setBulkReviewLoadingByRequest((prev) => ({ ...prev, [requestId]: false }));
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

  const renderFormNamesHeader = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '280px 510px 210px', marginTop: '10px', alignItems: 'center' }}>
        <div></div>
        <div style={{ display: 'flex', gap: '10px', width: '510px' }}>
          {formNames.map((name, index) => (
            <div
              key={`form-name-${index}`}
              style={{
                width: '120px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#1976d2'
              }}
            >
              <Typography
                variant="body2"
                align="center"
                style={{
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={name}
              >
                {name}
              </Typography>
            </div>
          ))}
        </div>
        <div></div>
      </div>
    );
  };

  const renderRequestList = ({ requests, readOnlyMode = false, isReceived = false }) => (
    <List>
      {requests.map((request) => (
        <ListItem
          key={`${readOnlyMode ? 'readonly' : 'own'}-${request.idSolicitud}`}
          style={{ display: 'grid', gridTemplateColumns: '280px 510px 210px', alignItems: 'center', columnGap: '12px' }}
        >
          {(() => {
            const waitingCorrections = hasCorrectionsInRequest(request);
            const titleText = isReceived
              ? `${request.fecha_solicitud || 'Sin fecha'} - ${request.nombre_solicitante || 'Usuario sin nombre'} - ${request.nombre_actividad || `Solicitud ${request.idSolicitud} `} `
              : (request.nombre_actividad || `Solicitud ${request.idSolicitud}  `);

            return (
              <ListItemText
                sx={{ m: 0 }}
                primary={
                  <span>
                    {titleText}
                    {waitingCorrections && (
                      <span style={{ color: '#ef6c00', fontWeight: 700, marginLeft: '8px' }}>
                        Esperando correccion
                      </span>
                    )}
                  </span>
                }
              />
            );
          })()}

          <div style={{ display: 'flex', gap: '10px', width: '510px' }}>
            {[1, 2, 3, 4].map((formNumber) => {
              if (readOnlyMode) {
                return (
                  <Button
                    key={`view-${request.idSolicitud}-${formNumber}`}
                    variant="contained"
                    style={{
                      backgroundColor: '#1976d2',
                      width: '120px',
                      height: '36px',
                    }}
                    onClick={() => handleNavigateToForm(request, formNumber, true)}
                  >
                    {formNumber}
                  </Button>
                );
              }

              const { formEnabled, reportEnabled, formColor, reportColor } = getButtonState(request, formNumber, { isReceived });

              const formStatus = resolveFormStatus(request, formNumber);
              const shouldReadOnly = isReceived || (!isAdmin && isLockedForOwner(formStatus));
              const canSelectForReview = !readOnlyMode && !isReceived && !isAdmin && isFormSelectableForReview(request, formNumber);
              const isSelected = Boolean(selectedFormsByRequest[request.idSolicitud]?.[formNumber]);

              return (
                <div key={`container-${request.idSolicitud}-${formNumber}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
                  {!readOnlyMode && !isReceived && !isAdmin && (
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggleFormSelection(request.idSolicitud, formNumber)}
                      disabled={!canSelectForReview || bulkReviewLoadingByRequest[request.idSolicitud]}
                      sx={{ p: 0.5 }}
                    />
                  )}
                  <div style={{ display: 'flex', width: '100%', height: '36px' }}>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: formColor,
                        cursor: formEnabled ? 'pointer' : 'not-allowed',
                        flex: 1,
                        borderRadius: '4px 0 0 4px',
                        minWidth: 'unset',
                        padding: '6px 8px',
                        height: '36px'
                      }}
                      onClick={() => handleNavigateToForm(request, formNumber, shouldReadOnly)}
                      disabled={!formEnabled}
                    >
                      {formNumber}
                    </Button>

                    {reportEnabled ? (
                      <Tooltip title="Generar reporte">
                        <span>
                          <Button
                            variant="contained"
                            style={{
                              backgroundColor: reportColor,
                              cursor: loadingReports[`${request.idSolicitud}-${formNumber}`] ? 'wait' : 'pointer',
                              flex: 1,
                              borderRadius: '0 4px 4px 0',
                              minWidth: 'unset',
                              padding: '6px 8px',
                              height: '36px'
                            }}
                            onClick={() => handleDownloadFormReport(request, formNumber)}
                            disabled={loadingReports[`${request.idSolicitud}-${formNumber}`]}
                          >
                            {loadingReports[`${request.idSolicitud}-${formNumber}`] ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <Print style={{ fontSize: '16px' }} />
                            )}
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Formulario no completado">
                        <span>
                          <Button
                            variant="contained"
                            style={{
                              backgroundColor: reportColor,
                              cursor: 'not-allowed',
                              flex: 1,
                              borderRadius: '0 4px 4px 0',
                              minWidth: 'unset',
                              padding: '6px 8px',
                              height: '36px'
                            }}
                            disabled
                          >
                            <Print style={{ fontSize: '16px' }} />
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!readOnlyMode && !isReceived && !isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleSendSelectedFormsToReview(request)}
              disabled={Boolean(bulkReviewLoadingByRequest[request.idSolicitud])}
              style={{ minWidth: '190px', justifySelf: 'start' }}
            >
              {bulkReviewLoadingByRequest[request.idSolicitud] ? 'Enviando...' : 'Enviar seleccionados a revision'}
            </Button>
          )}
        </ListItem>
      ))}
    </List>
  );

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
          Mis Solicitudes:
        </Typography>
        {ownRequests.length > 0 && renderFormNamesHeader()}
        {renderRequestList({ requests: ownRequests, readOnlyMode: false })}

        {isAdmin && (
          <>
            <Typography variant="h6" style={{ marginTop: '20px' }}>
              Solicitudes recibidas:
            </Typography>
            {receivedRequests.length > 0 && renderFormNamesHeader()}
            {renderRequestList({ requests: receivedRequests, readOnlyMode: false, isReceived: true })}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

Dashboard.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};



export default Dashboard;
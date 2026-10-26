import axios from 'axios';
import { config } from '../config';

const workflowClient = axios.create({ baseURL: config.API_URL, withCredentials: true });
workflowClient.interceptors.request.use((request) => {
  const token = localStorage.getItem('google_token');
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

export const getWorkflowQueue = async () => {
  const response = await workflowClient.get('/workflow/cola');
  const payload = response.data;
  return Array.isArray(payload) ? payload : (payload?.data || payload?.solicitudes || []);
};

export const getWorkflowConsultation = async () => {
  const response = await workflowClient.get('/workflow/solicitudes/consulta');
  const payload = response.data;
  return Array.isArray(payload) ? payload : (payload?.data || payload?.solicitudes || []);
};

export const takeWorkflowRequest = async (idSolicitud) => {
  const response = await workflowClient.post(`/workflow/${idSolicitud}/tomar`);
  return response.data;
};

export const submitWorkflowDecision = async (idSolicitud, {
  accion,
  comentario = '',
  comentarios_por_formulario = {},
  observaciones = [],
}) => {
  const response = await workflowClient.post(`/workflow/${idSolicitud}/decision`, {
    accion,
    comentario,
    comentarios_por_formulario,
    observaciones,
  });
  return response.data;
};

export const getWorkflowObservations = async (idSolicitud) => {
  const response = await workflowClient.get(`/workflow/${idSolicitud}/observaciones`);
  const payload = response.data;
  return Array.isArray(payload) ? payload : (payload?.data || []);
};

export const addWorkflowObservation = async (idSolicitud, observation) => {
  const response = await workflowClient.post(`/workflow/${idSolicitud}/observaciones`, observation);
  return response.data;
};

export const updateWorkflowObservation = async (idSolicitud, observationId, update) => {
  const response = await workflowClient.patch(`/workflow/${idSolicitud}/observaciones/${observationId}`, update);
  return response.data;
};

export const registerWorkflowSignature = async (idSolicitud, {
  file,
  observaciones = '',
  fechaSolicitudFirma = '',
}) => {
  const formData = new FormData();
  formData.append('evidencia_firma', file);
  if (observaciones) formData.append('observaciones', observaciones);
  if (fechaSolicitudFirma) formData.append('fecha_solicitud_firma', fechaSolicitudFirma);
  const response = await workflowClient.post(`/workflow/${idSolicitud}/firma`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const sendWorkflowRequestToDecanato = async (idSolicitud, {
  destinatariosDecanato = [],
  asuntoDecanato = '',
  cuerpoDecanato = '',
}) => {
  const response = await workflowClient.post(`/workflow/${idSolicitud}/enviar-decanato`, {
    destinatarios_decanato: destinatariosDecanato,
    asunto_decanato: asuntoDecanato,
    cuerpo_decanato: cuerpoDecanato,
  });
  return response.data;
};

export const remindWorkflowSignature = async (idSolicitud, tipoFirma) => {
  const response = await workflowClient.post(`/workflow/${idSolicitud}/firma/recordatorio`, {
    tipo_firma: tipoFirma,
  });
  return response.data;
};

export const getPendingSignatures = async () => {
  const response = await workflowClient.get('/workflow/firmas/pendientes');
  const payload = response.data;
  return Array.isArray(payload) ? payload : (payload?.data || []);
};

export const submitDecanatoCut = async ({ idSolicitud, resultado, observaciones = '', resolucion = '', pdfResolucion }) => {
  const formData = new FormData();
  formData.append('id_solicitud', idSolicitud);
  formData.append('resultado', resultado);
  if (observaciones) formData.append('observaciones', observaciones);
  if (resolucion) formData.append('resolucion', resolucion);
  if (pdfResolucion) formData.append('pdf_resolucion', pdfResolucion);
  const response = await workflowClient.post('/workflow/cortes-decanato', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

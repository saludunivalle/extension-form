import axios from 'axios';
import { config } from '../config';

const API_URL = config.API_URL;

export const getRevisionStatus = async (idSolicitud, userId) => {
  const response = await axios.get(`${API_URL}/estadoRevisionSolicitud`, {
    params: {
      id_solicitud: idSolicitud,
      userId,
    },
  });

  return response.data;
};

export const sendFormsToRevision = async ({ id_solicitud, userId, formularios }) => {
  const payload = {
    id_solicitud,
    userId,
  };

  if (Array.isArray(formularios) && formularios.length > 0) {
    payload.formularios = formularios;
  }

  try {
    const response = await axios.post(`${API_URL}/enviarFormulariosRevision`, payload);
    return response.data;
  } catch (error) {
    const fallback = await axios.post(`${API_URL}/enviarSolicitudRevision`, payload);
    return fallback.data;
  }
};

export const approveForms = async ({ id_solicitud, userId, formularios }) => {
  const payload = { id_solicitud, userId, formularios };

  try {
    const response = await axios.post(`${API_URL}/admin/aprobarFormularios`, payload);
    return response.data;
  } catch (error) {
    const fallback = await axios.post(`${API_URL}/admin/aprobarSolicitud`, payload);
    return fallback.data;
  }
};

export const approveFullRequest = async ({ id_solicitud, userId }) => {
  const response = await axios.post(`${API_URL}/admin/aprobarSolicitudCompleta`, {
    id_solicitud,
    userId,
  });

  return response.data;
};

export const sendCorrections = async ({ id_solicitud, userId, formularios, comentarios_por_formulario, comentarios }) => {
  const response = await axios.post(`${API_URL}/admin/enviarCorrecciones`, {
    id_solicitud,
    userId,
    formularios,
    comentarios_por_formulario,
    comentarios,
  });

  return response.data;
};

export const getCurrentFormStatus = (statusResponseData, formId) => {
  const estados = statusResponseData?.data?.estado_formularios || statusResponseData?.estado_formularios || {};
  return estados?.[String(formId)] || '';
};

const parseCommentsMap = (rawComments) => {
  if (!rawComments) {
    return {};
  }

  if (typeof rawComments === 'object' && !Array.isArray(rawComments)) {
    return rawComments;
  }

  if (typeof rawComments === 'string') {
    try {
      const parsed = JSON.parse(rawComments);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      return {};
    }
  }

  return {};
};

export const getCurrentFormComment = (statusResponseData, formId) => {
  const payload = statusResponseData?.data || statusResponseData || {};
  const formKey = String(formId);

  const commentsByForm = parseCommentsMap(payload.comentarios_por_formulario);
  const commentsFromGeneralField = parseCommentsMap(payload.comentarios);

  const formComment = commentsByForm?.[formKey] || commentsFromGeneralField?.[formKey];
  if (typeof formComment === 'string' && formComment.trim()) {
    return formComment.trim();
  }

  if (typeof payload.comentarios === 'string' && payload.comentarios.trim()) {
    return payload.comentarios.trim();
  }

  return '';
};

export const isApprovedStatus = (status) => {
  return String(status || '').trim().toLowerCase() === 'aprobado';
};

export const isSentToReviewStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'enviado a revisión' || normalized === 'enviado a revision';
};

export const isCorrectionsStatus = (status) => {
  return String(status || '').trim().toLowerCase() === 'requiere correcciones';
};

export const isCompletedStatus = (status) => {
  return String(status || '').trim().toLowerCase() === 'completado';
};

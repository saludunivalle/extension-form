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
  } catch {
    const fallback = await axios.post(`${API_URL}/enviarSolicitudRevision`, payload);
    return fallback.data;
  }
};

export const approveForms = async ({ id_solicitud, userId, formularios }) => {
  const payload = { id_solicitud, userId, formularios };

  try {
    const response = await axios.post(`${API_URL}/admin/aprobarFormularios`, payload);
    return response.data;
  } catch {
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
  const payload = {
    id_solicitud,
    userId,
    formularios,
    comentarios_por_formulario,
  };

  if (typeof comentarios === 'string' && comentarios.trim()) {
    payload.comentarios = comentarios.trim();
  }

  const response = await axios.post(`${API_URL}/admin/enviarCorrecciones`, payload);

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
    } catch {
      return {};
    }
  }

  return {};
};

const parseFormStepCommentString = (rawValue) => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return {};
  }

  return rawValue
    .split(/;|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const match = item.match(/^(\d+)\.\s*(.+)$/);
      if (!match) {
        return acc;
      }

      const [, step, comment] = match;
      const normalizedComment = String(comment || '').trim();
      if (normalizedComment) {
        acc[String(step)] = normalizedComment;
      }

      return acc;
    }, {});
};

const serializeFormStepCommentString = (stepComments = {}) => {
  const entries = Object.entries(stepComments)
    .filter(([, comment]) => typeof comment === 'string' && comment.trim())
    .sort(([stepA], [stepB]) => Number(stepA) - Number(stepB));

  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([step, comment]) => `${step}. ${comment.trim()}`)
    .join('; ');
};

export const getCommentsMap = (statusResponseData) => {
  const payload = statusResponseData?.data || statusResponseData || {};
  const commentsByForm = parseCommentsMap(payload.comentarios_por_formulario);
  const commentsFromGeneralField = parseCommentsMap(payload.comentarios);

  return {
    ...commentsFromGeneralField,
    ...commentsByForm,
  };
};

export const getStepCommentsByForm = (statusResponseData) => {
  const commentsMap = getCommentsMap(statusResponseData);

  return Object.entries(commentsMap).reduce((acc, [key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const formKey = String(key);
      const normalizedSteps = Object.entries(value).reduce((stepsAcc, [stepKey, stepComment]) => {
        if (typeof stepComment === 'string' && stepComment.trim()) {
          stepsAcc[String(stepKey)] = stepComment.trim();
        }
        return stepsAcc;
      }, {});

      if (Object.keys(normalizedSteps).length > 0) {
        acc[formKey] = {
          ...(acc[formKey] || {}),
          ...normalizedSteps,
        };
      }

      return acc;
    }

    if (typeof value === 'string' && value.trim() && /^\d+$/.test(String(key))) {
      const formKey = String(key);
      const parsedSteps = parseFormStepCommentString(value);
      if (Object.keys(parsedSteps).length > 0) {
        acc[formKey] = {
          ...(acc[formKey] || {}),
          ...parsedSteps,
        };
      }
      return acc;
    }

    if (typeof value === 'string' && value.trim() && String(key).includes('.')) {
      const [formKey, stepKey] = String(key).split('.');
      if (formKey && stepKey) {
        acc[formKey] = {
          ...(acc[formKey] || {}),
          [String(stepKey)]: value.trim(),
        };
      }
    }

    return acc;
  }, {});
};

export const getAllStepCommentsFlat = (statusResponseData) => {
  const commentsByForm = getStepCommentsByForm(statusResponseData);

  return Object.entries(commentsByForm).reduce((acc, [formKey, steps]) => {
    if (!steps || typeof steps !== 'object' || Array.isArray(steps)) {
      return acc;
    }

    Object.entries(steps).forEach(([stepKey, comment]) => {
      if (typeof comment === 'string' && comment.trim()) {
        acc[`${String(formKey)}.${String(stepKey)}`] = comment.trim();
      }
    });

    return acc;
  }, {});
};

export const buildLegacyFormCommentsPayloadForStep = (statusResponseData, formId, stepNumber, comment) => {
  const formKey = String(formId);
  const stepKey = String(Number(stepNumber));
  const normalizedComment = String(comment || '').trim();
  const stepCommentsByForm = getStepCommentsByForm(statusResponseData);

  const merged = {
    ...stepCommentsByForm,
    [formKey]: {
      ...(stepCommentsByForm?.[formKey] || {}),
      [stepKey]: normalizedComment,
    },
  };

  return Object.entries(merged).reduce((acc, [currentFormKey, currentFormSteps]) => {
    const serialized = serializeFormStepCommentString(currentFormSteps);
    if (serialized) {
      acc[String(currentFormKey)] = serialized;
    }
    return acc;
  }, {});
};

export const getCurrentStepComment = (statusResponseData, formId, stepNumber) => {
  const stepCommentsByForm = getStepCommentsByForm(statusResponseData);
  const formKey = String(formId);
  const stepKey = String(Number(stepNumber));
  const normalizedComment = stepCommentsByForm?.[formKey]?.[stepKey];

  if (typeof normalizedComment === 'string' && normalizedComment.trim()) {
    return normalizedComment.trim();
  }

  const commentsMap = getCommentsMap(statusResponseData);
  const flatStepKey = `${String(formId)}.${Number(stepNumber)}`;
  const rawComment = commentsMap?.[flatStepKey];

  if (typeof rawComment === 'string' && rawComment.trim()) {
    return rawComment.trim();
  }

  return '';
};

export const getFormStepComments = (statusResponseData, formId) => {
  const formKey = String(formId);
  const stepComments = getStepCommentsByForm(statusResponseData)?.[formKey] || {};

  return Object.entries(stepComments).reduce((acc, [stepKey, comment]) => {
    acc[`${formKey}.${stepKey}`] = comment;
    return acc;
  }, {});
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

  const stepCommentEntries = Object.entries(getFormStepComments(statusResponseData, formId)).sort(([a], [b]) => {
    const stepA = Number(a.split('.')[1] || 0);
    const stepB = Number(b.split('.')[1] || 0);
    return stepA - stepB;
  });

  if (stepCommentEntries.length > 0) {
    return stepCommentEntries[stepCommentEntries.length - 1][1];
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

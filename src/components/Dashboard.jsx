import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { downloadFormReport } from "../services/reportServices";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  Checkbox,
  Box,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { config } from "../config";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  CheckCircle,
  DownloadOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  approveFullRequest,
  sendCorrections,
  sendFormsToRevision,
} from "../services/revisionService";
import {
  getWorkflowConsultation,
  getWorkflowQueue,
  getWorkflowObservations,
  registerWorkflowSignature,
  sendWorkflowRequestToDecanato,
  sendWorkflowRequestToPresupuesto,
  getWorkflowFormPdf,
  getWorkflowSignatureImage,
  remindWorkflowSignature,
  submitDecanatoCut,
  submitWorkflowDecision,
  updateWorkflowObservation,
  deleteWorkflowObservation,
} from "../services/workflowService";
import WorkflowRoleView from "./Workflow/WorkflowRoleView";
const API_URL = config.API_URL;
const WORKFLOW_ONLY_ROLES = new Set([
  "revisor_1",
  "revisor_2",
  "presupuesto",
  "director",
  "decanato",
]);

const formatHistoryAction = (action) => {
  const labels = {
    aprobar: "Aprobado",
    devolver: "Devuelto con observaciones",
    tomar: "Tomado en revisión",
    firmar: "Firmado",
    enviar_revision: "Enviado a Revisión 1",
    reenviar_correcciones: "Correcciones reenviadas a revisión",
    enviar_presupuesto: "Enviado a Presupuesto",
    enviar_decanato: "Enviado a Decanato",
    registrar_decision: "Decisión registrada",
  };
  const key = String(action || "")
    .trim()
    .toLowerCase();
  return labels[key] || String(action || "Movimiento registrado");
};

const formatHistoryStage = (stage, action = "") => {
  const rawStage = String(stage || "")
    .trim()
    .toLowerCase();
  const stageLabels = {
    solicitud: "Solicitud",
    revision_1: "Revisión 1",
    "revision 1": "Revisión 1",
    "revisión 1": "Revisión 1",
    revision_2: "Revisión 2",
    "revision 2": "Revisión 2",
    "revisión 2": "Revisión 2",
    firmas: "Firmas",
    presupuesto: "Presupuesto",
    decanato: "Decanato",
    "en decanato": "Decanato",
    finalizado: "Finalizado",
  };
  if (stageLabels[rawStage]) return stageLabels[rawStage];

  const rawAction = String(action || "")
    .trim()
    .toLowerCase();
  if (["enviar_revision", "reenviar_correcciones"].includes(rawAction)) {
    return "Solicitud";
  }
  if (["firmar", "enviar_presupuesto"].includes(rawAction)) {
    return "Firmas";
  }
  if (rawAction === "enviar_decanato") {
    return "Presupuesto";
  }
  if (rawAction === "registrar_decision") {
    return "Decanato";
  }
  return stage ? String(stage) : "Etapa";
};

const formatHistoryRole = (role) => {
  const rawRole = String(role || "")
    .trim()
    .toLowerCase();
  const roleLabels = {
    solicitante: "Solicitante",
    revisor_1: "Revisor 1",
    revisor_2: "Revisor 2",
    presupuesto: "Presupuesto",
    director: "Director",
    decanato: "Decanato",
    admin: "Administrador",
  };
  return roleLabels[rawRole] || String(role || "Sistema");
};

const formatHistoryDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Fecha no disponible";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Bogota",
  }).format(parsed);
};

const flattenSolicitudResponse = (data) => {
  if (!data || typeof data !== "object") {
    return {};
  }

  const rootFields = {};
  const nestedFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(nestedFields, value);
    } else {
      rootFields[key] = value;
    }
  });

  return Object.keys(nestedFields).length > 0
    ? { ...rootFields, ...nestedFields }
    : data;
};

const parseEstadoFormularios = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
};

const parseNestedObject = (value) => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parseNestedObject(JSON.parse(value));
    } catch {
      return {};
    }
  }
  if (Array.isArray(value)) {
    return value.reduce(
      (result, item) => ({
        ...result,
        ...parseNestedObject(item),
      }),
      {},
    );
  }
  return typeof value === "object" ? value : {};
};

const findEstadoFormularios = (source) => {
  if (!source) return null;

  if (typeof source === "string") {
    try {
      return findEstadoFormularios(JSON.parse(source));
    } catch {
      return null;
    }
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findEstadoFormularios(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof source !== "object") return null;

  const statusEntry = Object.entries(source).find(
    ([key]) =>
      key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === "estadoformularios",
  );
  if (statusEntry) {
    return parseEstadoFormularios(statusEntry[1]);
  }

  for (const value of Object.values(source)) {
    const found = findEstadoFormularios(value);
    if (found) return found;
  }

  return null;
};

const getLegacyEstadoValue = (source, formNumber) => {
  if (!source || typeof source !== "object") return "";

  return (
    source[`estado_formulario_${formNumber}`] ||
    source[`estado_formulario${formNumber}`] ||
    source[`estadoFormulario_${formNumber}`] ||
    source[`estadoFormulario${formNumber}`] ||
    ""
  );
};

const extractEstadoFormularios = (request) => {
  const etapas = parseNestedObject(request?.ETAPAS || request?.etapas);
  const solicitudes = parseNestedObject(request?.SOLICITUDES);
  const estados =
    findEstadoFormularios(etapas) || findEstadoFormularios(request) || {};

  for (let formNumber = 1; formNumber <= 4; formNumber += 1) {
    const legacyState =
      getLegacyEstadoValue(request, formNumber) ||
      getLegacyEstadoValue(solicitudes, formNumber) ||
      getLegacyEstadoValue(etapas, formNumber);

    if (legacyState && !estados[String(formNumber)]) {
      estados[String(formNumber)] = legacyState;
    }
  }

  return estados;
};

const resolveFormStatus = (request, formNumber) => {
  const formKey = String(formNumber);
  let source = extractEstadoFormularios(request);

  // El backend puede entregar el mapa como string JSON.
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      source = {};
    }
  }

  const value =
    source?.[formKey] ??
    getLegacyEstadoValue(request, formNumber) ??
    getLegacyEstadoValue(request?.SOLICITUDES, formNumber) ??
    "";

  // Algunas respuestas antiguas anidan nuevamente el mapa completo.
  if (typeof value === "object" && value !== null) return value[formKey] || "";
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return parsed?.[formKey] || "";
    } catch {
      return value;
    }
  }
  return value;
};

const normalizeStatusForMatch = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const isCompletedStatus = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized === "completado" || normalized === "completados";
};

const isCorrectionsStatus = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized.includes("requiere correccion");
};

const hasCorrectionsInRequest = (request) => {
  const estados = request?.estadoFormularios;
  if (
    estados &&
    typeof estados === "object" &&
    Object.values(estados).some((estado) => isCorrectionsStatus(estado))
  ) {
    return true;
  }

  const comments = request?.comentarios;
  return (
    comments &&
    typeof comments === "object" &&
    Object.values(comments).some(
      (items) =>
        Array.isArray(items) &&
        items.some(
          (item) =>
            item?.estado === "pendiente" ||
            item?.estado === "requiere_correcciones",
        ),
    )
  );
};

const isRequestInCorrection = (request) => {
  if (!request) return false;
  const rawStage = String(
    request?.etapa_codigo ||
      request?.etapaCodigo ||
      request?.etapa_actual ||
      (request?.ETAPAS &&
        (request.ETAPAS.etapa_codigo || request.ETAPAS.etapaCodigo)) ||
      "",
  )
    .trim()
    .toLowerCase();

  // Si la solicitud ya avanzó o está en una fase de revisión/firmas/presupuesto/decanato, NO requiere corrección por el solicitante
  if (
    rawStage &&
    rawStage !== "solicitud" &&
    rawStage !== "0" &&
    rawStage !== "1"
  ) {
    return false;
  }

  const stageState = String(request?.estado_etapa || "")
    .trim()
    .toLowerCase();
  if (stageState === "devuelta" || stageState === "requiere_correcciones") {
    return true;
  }
  const formState = String(request?.estado || "")
    .trim()
    .toLowerCase();
  if (
    formState === "requiere correccion" ||
    formState === "requiere correcciones"
  ) {
    return true;
  }
  const estados = request?.estadoFormularios;
  if (
    estados &&
    typeof estados === "object" &&
    Object.values(estados).some((estado) => isCorrectionsStatus(estado))
  ) {
    return true;
  }
  const comments = request?.comentarios;
  if (
    comments &&
    typeof comments === "object" &&
    Object.values(comments).some(
      (items) =>
        Array.isArray(items) &&
        items.some(
          (obs) => getObservationStatusMeta(obs?.estado).key !== "subsanada",
        ),
    )
  ) {
    if (stageState === "devuelta" || stageState === "requiere_correcciones") {
      return true;
    }
  }
  return false;
};

const getObservationStatusMeta = (estado) => {
  const normalized = normalizeStatusForMatch(estado);
  if (normalized === "subsanada") {
    return { key: "subsanada", label: "Subsanada", color: "success" };
  }
  if (normalized === "corregida") {
    return { key: "corregida", label: "Corregida", color: "info" };
  }
  return { key: "pendiente", label: "Pendiente", color: "warning" };
};

const filterActiveObservations = (observations = []) =>
  observations.filter(
    (observation) => getObservationStatusMeta(observation?.estado).key !== "subsanada",
  );

const getPendingObservations = (observations = []) =>
  filterActiveObservations(observations).filter(
    (observation) => getObservationStatusMeta(observation?.estado).key === "pendiente",
  );

const isLockedForOwner = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized === "enviado a revision" || normalized === "aprobado";
};

const normalizeRequest = (request) => {
  if (Array.isArray(request)) {
    const [
      idSolicitud,
      idUsuario,
      fechaSolicitud,
      nombreSolicitante,
      etapaActualRaw,
      estadoFormulariosRaw,
      nombreActividad,
      paso,
      estadoFormulario,
      estadoGeneral,
      comentariosRaw,
      comentariosPorFormularioRaw,
      etapaCodigo,
      rolResponsable,
      usuarioAsignado,
      estadoEtapa,
      fechaInicio,
      fechaFin,
      etapaAnterior,
      updatedAt,
      version,
      nombreDependenciaRaw,
      resultadoCorte,
      observacionesCorte,
      resolucionCorte,
      archivoResolucionCorte,
      firmaSolicitanteRaw,
      firmaDirectorRaw,
      firmasCompletasRaw,
      firmaSolicitanteInfoRaw,
      firmaDirectorInfoRaw,
    ] = request;

    const estados = parseEstadoFormularios(estadoFormulariosRaw);
    const etapaActual = Number(etapaActualRaw);
    const etapaEsNumerica = Number.isFinite(etapaActual) && etapaActual > 0;
    const isCompactRequest = request.length <= 12;
    const nombreDependencia = isCompactRequest
      ? request[11] || ""
      : nombreDependenciaRaw || "";
    if (etapaEsNumerica && estadoFormulario && !estados[String(etapaActual)]) {
      estados[String(etapaActual)] = estadoFormulario;
    }

    return {
      idSolicitud: idSolicitud || null,
      id_usuario: idUsuario || null,
      fecha_solicitud: fechaSolicitud || "",
      nombre_solicitante: nombreSolicitante || "",
      formulario: etapaEsNumerica ? etapaActual : 0,
      estado: estadoFormulario || "",
      nombre_actividad: nombreActividad || "",
      nombre_dependencia: nombreDependencia || "",
      resultado: resultadoCorte || "",
      observaciones: observacionesCorte || "",
      resolucion: resolucionCorte || "",
      archivo_resolucion: archivoResolucionCorte || "",
      paso: Number(paso) || 0,
      etapa_actual: etapaEsNumerica ? etapaActual : 0,
      estadoFormularios: estados,
      estado_general: estadoGeneral || "",
      etapa_codigo: etapaCodigo || (!etapaEsNumerica ? etapaActualRaw : ""),
      rol_responsable: rolResponsable || "",
      usuario_asignado: usuarioAsignado || "",
      estado_etapa: estadoEtapa || "",
      comentarios: parseEstadoFormularios(comentariosRaw),
      comentarios_por_formulario: parseEstadoFormularios(
        isCompactRequest ? "" : comentariosPorFormularioRaw,
      ),
      fecha_inicio: fechaInicio || "",
      fecha_fin: fechaFin || "",
      etapa_anterior: etapaAnterior || "",
      updated_at: updatedAt || "",
      version: version || "",
      firma_solicitante:
        firmaSolicitanteRaw === true || String(firmaSolicitanteRaw) === "true",
      firma_director:
        firmaDirectorRaw === true || String(firmaDirectorRaw) === "true",
      firmas_completas:
        firmasCompletasRaw === true || String(firmasCompletasRaw) === "true",
      firma_solicitante_info: firmaSolicitanteInfoRaw || null,
      firma_director_info: firmaDirectorInfoRaw || null,
    };
  }

  return {
    ...request,
    firma_solicitante:
      request.firma_solicitante === true ||
      String(request.firma_solicitante) === "true",
    firma_director:
      request.firma_director === true ||
      String(request.firma_director) === "true",
    firmas_completas:
      request.firmas_completas === true ||
      String(request.firmas_completas) === "true",
    idSolicitud:
      request.idSolicitud ||
      request.id_solicitud ||
      request.id ||
      request.solicitud_id,
    id_usuario:
      request.id_usuario ||
      request.idUsuario ||
      request.userId ||
      request.id_user ||
      request.user_id ||
      request.solicitante_id ||
      request.idSolicitante ||
      request.usuario?.id ||
      request.user?.id ||
      null,
    nombre_actividad:
      request.nombre_actividad ||
      request.nombreActividad ||
      request.solicitud ||
      request.actividad ||
      request.titulo ||
      "",
    nombre_solicitante:
      request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.usuario?.name ||
      request.user?.name ||
      "",
    nombre_dependencia:
      request.nombre_dependencia ||
      request.nombreDependencia ||
      findNestedField(request.SOLICITUDES, [
        "nombre_dependencia",
        "nombreDependencia",
      ]) ||
      findNestedField(request, ["nombre_dependencia", "nombreDependencia"]) ||
      "",
    resultado:
      request.resultado ||
      request.estado_final ||
      request.corte_decanato?.resultado ||
      request.corte_decanato?.estado_final ||
      "",
    observaciones:
      request.observaciones || request.corte_decanato?.observaciones || "",
    resolucion: request.resolucion || request.corte_decanato?.resolucion || "",
    archivo_resolucion:
      request.archivo_resolucion ||
      request.corte_decanato?.archivo_resolucion ||
      "",
    fecha_solicitud:
      request.fecha_solicitud ||
      request.fechaSolicitud ||
      request.fecha_creacion ||
      request.fechaCreacion ||
      request.ETAPAS?.fecha_creacion ||
      request.etapas?.fecha_creacion ||
      "",
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
    estado_general:
      request.estado_general ||
      request.estadoGeneral ||
      request.ETAPAS?.estado_general ||
      request.etapas?.estado_general ||
      "",
    etapa_codigo:
      request.etapa_codigo ||
      request.etapaCodigo ||
      request.ETAPAS?.etapa_codigo ||
      request.etapas?.etapa_codigo ||
      (typeof request.etapa_actual === "string"
        ? request.etapa_actual
        : typeof request.formulario === "string"
          ? request.formulario
          : ""),
    etapa_anterior:
      request.etapa_anterior ||
      request.etapaAnterior ||
      request.ETAPAS?.etapa_anterior ||
      request.etapas?.etapa_anterior ||
      "",
    estado_etapa:
      request.estado_etapa ||
      request.estadoEtapa ||
      request.ETAPAS?.estado_etapa ||
      request.etapas?.estado_etapa ||
      "",
    rol_responsable:
      request.rol_responsable ||
      request.rolResponsable ||
      request.ETAPAS?.rol_responsable ||
      request.etapas?.rol_responsable ||
      "",
    historial:
      request.historial ||
      request.historial_etapas ||
      request.HISTORIAL_ETAPAS ||
      [],
  };
};

const resolveRequestOwnerId = (request) => {
  return (
    request.id_usuario ||
    request.idUsuario ||
    request.userId ||
    request.id_user ||
    request.user_id ||
    request.solicitante_id ||
    request.idSolicitante ||
    request.usuario?.id ||
    request.user?.id ||
    null
  );
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isOwnRequest = (
  request,
  currentUserId,
  currentUserName,
  currentUserEmail,
) => {
  const ownerId = resolveRequestOwnerId(request);

  if (ownerId) {
    return String(ownerId) === String(currentUserId);
  }

  const requestOwnerName = normalizeText(
    request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.usuario?.name ||
      request.user?.name,
  );
  const requestOwnerEmail = normalizeText(
    request.email_solicitante ||
      request.correo_solicitante ||
      request.usuario?.email ||
      request.user?.email,
  );

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
  return requests.filter(
    (request, index, array) =>
      array.findIndex(
        (item) => String(item.idSolicitud) === String(request.idSolicitud),
      ) === index,
  );
};

const normalizeRevisionRequest = (request) => {
  if (Array.isArray(request)) {
    return normalizeRequest(request);
  }

  const stage = findNestedField(request, ["etapa_codigo", "etapaCodigo"]);

  return {
    ...request,
    idSolicitud:
      request.idSolicitud ||
      request.id_solicitud ||
      request.id ||
      request.solicitud_id,
    id_usuario:
      request.id_usuario ||
      request.idUsuario ||
      request.userId ||
      request.user?.id ||
      request.usuario?.id ||
      null,
    fecha_solicitud:
      request.fecha_solicitud ||
      request.fechaSolicitud ||
      request.fecha ||
      request.fecha_creacion ||
      request.fechaCreacion ||
      request.ETAPAS?.fecha_creacion ||
      request.etapas?.fecha_creacion ||
      "",
    nombre_solicitante:
      request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.name ||
      request.user?.name ||
      request.usuario?.name ||
      "",
    nombre_dependencia:
      request.nombre_dependencia ||
      request.nombreDependencia ||
      findNestedField(request.SOLICITUDES, [
        "nombre_dependencia",
        "nombreDependencia",
      ]) ||
      findNestedField(request, ["nombre_dependencia", "nombreDependencia"]) ||
      "",
    nombre_actividad:
      request.nombre_actividad ||
      request.nombreActividad ||
      request.solicitud ||
      request.actividad ||
      request.titulo ||
      "",
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
    estado_general:
      request.estado_general ||
      request.estadoGeneral ||
      request.ETAPAS?.estado_general ||
      "",
    etapa_codigo:
      stage ||
      (typeof request.etapa_actual === "string"
        ? request.etapa_actual
        : typeof request.formulario === "string"
          ? request.formulario
          : ""),
    estado_etapa:
      request.estado_etapa ||
      request.estadoEtapa ||
      request.ETAPAS?.estado_etapa ||
      request.etapas?.estado_etapa ||
      "",
    rol_responsable:
      request.rol_responsable ||
      request.rolResponsable ||
      request.ETAPAS?.rol_responsable ||
      "",
    historial: request.historial || request.historial_etapas || [],
  };
};

const findNestedField = (source, fieldNames) => {
  if (typeof source === "string") {
    try {
      return findNestedField(JSON.parse(source), fieldNames);
    } catch {
      return "";
    }
  }
  if (!source || typeof source !== "object") return "";
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findNestedField(item, fieldNames);
      if (found) return found;
    }
    return "";
  }

  for (const fieldName of fieldNames) {
    if (source[fieldName]) return source[fieldName];
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const found = findNestedField(value, fieldNames);
      if (found) return found;
    }
  }
  return "";
};

const getRequestStage = (request) => {
  if (isRequestInCorrection(request)) {
    return "solicitud";
  }
  const rawStage = String(
    findNestedField(request, ["etapa_codigo", "etapaCodigo"]),
  )
    .trim()
    .toLowerCase();
  const stageAliases = {
    "revision 1": "revision_1",
    "revision-1": "revision_1",
    "revision 2": "revision_2",
    "revision-2": "revision_2",
    terminado: "finalizado",
    completado: "finalizado",
    completada: "finalizado",
    finalizada: "finalizado",
  };
  return stageAliases[rawStage] || rawStage;
};

const getDecanatoResult = (request) =>
  request?.corte_decanato?.resultado ||
  request?.corte_decanato?.estado_final ||
  request?.resultado ||
  request?.estado_final ||
  "";

const getDecanatoResolution = (request) =>
  request?.corte_decanato?.resolucion || request?.resolucion || "";

const getDecanatoResolutionFile = (request) =>
  request?.corte_decanato?.archivo_resolucion ||
  request?.archivo_resolucion ||
  "";

const getHistoryActorName = (entry) =>
  entry?.nombre_actor ||
  entry?.nombre_usuario_actor ||
  entry?.nombre_usuario ||
  entry?.actor_name ||
  entry?.email_actor ||
  entry?.correo_actor ||
  "Usuario sin nombre";

const getRequestDescriptiveStatus = (request, role = "") => {
  const visualStatus = getRequestVisualStatus(request, role);
  if (visualStatus.tone === "correction" || visualStatus.tone === "rejected") {
    return visualStatus.label;
  }

  const stage = getRequestStage(request);
  const stageState = String(request?.estado_etapa || "")
    .trim()
    .toLowerCase();
  const signatures =
    Number(Boolean(request?.firma_solicitante)) +
    Number(Boolean(request?.firma_director));

  const labels = {
    solicitud:
      stageState === "borrador"
        ? "Borrador · pendiente de envío a revisión"
        : isRequestInCorrection(request)
          ? "Requiere corrección"
          : "Pendiente de envío a Revisión 1",
    revision_1:
      stageState === "en_revision"
        ? "En revisión 1"
        : "Pendiente de Revisión 1",
    revision_2:
      stageState === "en_revision"
        ? "En revisión 2"
        : "Pendiente de Revisión 2",
    firmas: request?.firmas_completas
      ? "Firmas completas · lista para enviar a Presupuesto"
      : `Pendiente de firmas (${signatures}/2)`,
    presupuesto:
      stageState === "en_revision"
        ? "En revisión presupuestal"
        : "Pendiente de Presupuesto",
    decanato: "Pendiente de decisión de Decanato",
    finalizado: visualStatus.label,
  };

  return labels[stage] || visualStatus.label;
};

const getRequestVisualStatus = (request, role = "") => {
  const stage = getRequestStage(request);
  const result = String(getDecanatoResult(request) || "")
    .trim()
    .toLowerCase();
  if (stage === "finalizado") {
    return result.includes("rechaz")
      ? { label: "Rechazada · proceso finalizado", tone: "rejected" }
      : { label: "En orden · solicitud aprobada", tone: "ok" };
  }
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  const isReviewer = ["revisor_1", "revisor_2"].includes(normalizedRole);

  if (isRequestInCorrection(request)) {
    return {
      label: isReviewer ? "Enviada a subsanar" : "Requiere corrección",
      tone: "correction",
    };
  }

  if (stage === "firmas" && request.firmas_completas) {
    return {
      label: "Pendiente · lista para enviar a Presupuesto",
      tone: "pending",
    };
  }
  return { label: "Pendiente", tone: "pending" };
};

const formatSignatureDateTime = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Fecha no disponible";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(parsed);
};

function SignatureImagePreview({ idSolicitud, tipoFirma, alt }) {
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl = "";
    setLoadingImage(true);
    setHasError(false);
    getWorkflowSignatureImage(idSolicitud, tipoFirma)
      .then((url) => {
        if (!active) {
          window.URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setImageUrl(url);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setLoadingImage(false);
      });
    return () => {
      active = false;
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [idSolicitud, tipoFirma]);

  if (loadingImage) {
    return <CircularProgress size={20} />;
  }
  if (hasError || !imageUrl) {
    return (
      <Typography variant="caption" color="text.secondary">
        No se pudo cargar la vista previa de la firma.
      </Typography>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={alt}
      className="workflow-signature-card__image"
    />
  );
}

SignatureImagePreview.propTypes = {
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  tipoFirma: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

function Dashboard({ userData }) {
  const [ownRequests, setOwnRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(
    userData?.role?.toLowerCase() === "admin",
  );
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState({});
  const [selectedFormsByRequest, setSelectedFormsByRequest] = useState({});
  const [bulkReviewLoadingByRequest, setBulkReviewLoadingByRequest] = useState(
    {},
  );
  const [reviewAction, setReviewAction] = useState({});
  const [reviewComment] = useState({});
  const [workflowObservations, setWorkflowObservations] = useState({});
  // const [observationDrafts, setObservationDrafts] = useState({});
  const [observationActionLoading, setObservationActionLoading] = useState({});
  const [signatureFiles, setSignatureFiles] = useState({});
  const [signatureNotes, setSignatureNotes] = useState({});
  const [confirmDirectorSignatureRequest, setConfirmDirectorSignatureRequest] =
    useState(null);
  const [decanatoEmailData, setDecanatoEmailData] = useState({});
  const [sendDecanatoRequest, setSendDecanatoRequest] = useState(null);
  const [sendingDecanato, setSendingDecanato] = useState(false);
  const [sendingPresupuestoId, setSendingPresupuestoId] = useState(null);
  const [decanatoData, setDecanatoData] = useState({});
  const [totalHoursByRequest, setTotalHoursByRequest] = useState({});
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
      default: {
        main: "#e0e0e0",
      },
    },
  });

  const fetchRequests = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    const role = String(userData?.role || "").toLowerCase();

    // Estos roles reciben sus solicitudes desde el endpoint del workflow.
    // Evitamos consultar también /getRequests para no duplicar lecturas en Sheets.
    if (WORKFLOW_ONLY_ROLES.has(role)) {
      setOwnRequests([]);
      setReceivedRequests([]);
      setLoading(false);
      return;
    }

    try {
      const requestsResponse = await axios.get(`${API_URL}/getRequests`, {
        params: { userId: userData.id },
      });
      console.log("Respuesta de /getRequests:", requestsResponse.data);

      const roleFromApi = requestsResponse.data.role || "";
      const adminFromApi = Boolean(requestsResponse.data?.isAdmin);
      const adminByRole =
        String(roleFromApi).toLowerCase() === "admin" ||
        String(userData?.role || "").toLowerCase() === "admin";
      const adminUser = adminFromApi || adminByRole;

      const activeRequestsData = Array.isArray(
        requestsResponse.data?.activeRequests,
      )
        ? requestsResponse.data.activeRequests
        : [];
      const completedRequestsData = Array.isArray(
        requestsResponse.data?.completedRequests,
      )
        ? requestsResponse.data.completedRequests
        : [];

      const normalizedActive = activeRequestsData.map(normalizeRequest);
      const normalizedCompleted = completedRequestsData.map(normalizeRequest);
      const mergedRequests = mergeUniqueRequests([
        ...normalizedActive,
        ...normalizedCompleted,
      ]).filter((request) => Boolean(request.idSolicitud));

      if (adminUser) {
        const own = mergedRequests.filter((request) =>
          isOwnRequest(request, userData.id, userData.name, userData.email),
        );
        const correctionsFromOthers = mergedRequests.filter(
          (request) =>
            !isOwnRequest(
              request,
              userData.id,
              userData.name,
              userData.email,
            ) && hasCorrectionsInRequest(request),
        );

        setOwnRequests(own);

        try {
          const revisionResponse = await axios.get(
            `${API_URL}/admin/solicitudesRevision`,
            {
              params: { userId: userData.id },
            },
          );

          const revisionData = Array.isArray(revisionResponse.data?.data)
            ? revisionResponse.data.data
            : [];
          console.log("Solicitudes en revisión para admin:", revisionData);

          const normalizedRevisionRequests = revisionData
            .map(normalizeRevisionRequest)
            .filter((request) => Boolean(request.idSolicitud));

          setReceivedRequests(
            mergeUniqueRequests([
              ...normalizedRevisionRequests,
              ...correctionsFromOthers,
            ]),
          );
        } catch (revisionError) {
          console.error(
            "Error al obtener solicitudes en revision para admin:",
            revisionError,
          );
          setReceivedRequests(correctionsFromOthers);
        }
      } else {
        setOwnRequests(mergedRequests);
        setReceivedRequests([]);
      }

      setIsAdmin(adminUser);
      console.log("Solicitudes cargadas desde /getRequests:", mergedRequests);
    } catch (error) {
      // Fallback para mantener compatibilidad con los endpoints actuales.
      try {
        const activeResponse = await axios.get(`${API_URL}/getActiveRequests`, {
          params: { userId: userData.id },
        });

        const activeRequests = Array.isArray(activeResponse.data)
          ? activeResponse.data
          : [];
        const requestsWithStages = activeRequests.map(normalizeRequest);

        let mergedRequests = [...requestsWithStages];

        try {
          const completedResponse = await axios.get(
            `${API_URL}/getCompletedRequests`,
            { params: { userId: userData.id } },
          );

          const fullyCompletedRequests = Array.isArray(completedResponse.data)
            ? completedResponse.data
            : [];
          const fullyCompletedRequestsWithStages =
            fullyCompletedRequests.map(normalizeRequest);

          const allCompleted = requestsWithStages.filter((request) => {
            if (!request.estadoFormularios) return false;
            return Object.values(request.estadoFormularios).every(
              isCompletedStatus,
            );
          });

          mergedRequests = mergeUniqueRequests([
            ...requestsWithStages,
            ...fullyCompletedRequestsWithStages,
            ...allCompleted,
          ]);
        } catch (completedError) {
          if (completedError.response?.status !== 404) {
            console.error(
              "Error al obtener solicitudes completadas:",
              completedError,
            );
          }
        }

        const isAdminFallback =
          String(userData?.role || "").toLowerCase() === "admin";
        const validRequests = mergedRequests.filter((request) =>
          Boolean(request.idSolicitud),
        );

        setIsAdmin(isAdminFallback);

        if (isAdminFallback) {
          const own = validRequests.filter((request) =>
            isOwnRequest(request, userData.id, userData.name, userData.email),
          );
          const correctionsFromOthers = validRequests.filter(
            (request) =>
              !isOwnRequest(
                request,
                userData.id,
                userData.name,
                userData.email,
              ) && hasCorrectionsInRequest(request),
          );

          setOwnRequests(own);
          setReceivedRequests(correctionsFromOthers);
        } else {
          setOwnRequests(validRequests);
          setReceivedRequests([]);
        }

        console.log("Solicitudes cargadas desde fallback:", mergedRequests);
      } catch (fallbackError) {
        console.error("Error al obtener solicitudes:", error);
        console.error("Error en fallback de solicitudes:", fallbackError);
        setOwnRequests([]);
        setReceivedRequests([]);
      }
    }
    setLoading(false);
  }, [userData]);

  useEffect(() => {
    if (userData && userData.id) {
      fetchRequests();
    }
  }, [fetchRequests, userData]);

  useEffect(() => {
    const workflowRoles = [
      "revisor_1",
      "revisor_2",
      "presupuesto",
      "decanato",
      "director",
      "admin",
    ];
    if (
      !userData?.id ||
      !workflowRoles.includes(String(userData.role || "").toLowerCase())
    )
      return undefined;
    setIsAdmin(true);
    let active = true;
    const loadWorkflowQueue = async () => {
      try {
        const role = String(userData.role || "").toLowerCase();
        const queueItems =
          role === "decanato"
            ? await getWorkflowQueue()
            : await getWorkflowConsultation();
        if (!active) return;
        const normalized = queueItems
          .map(normalizeRevisionRequest)
          .filter((item) => item.idSolicitud);
        setReceivedRequests((previous) =>
          mergeUniqueRequests([...normalized, ...previous]),
        );
        await Promise.all(
          normalized.map(async (request) => {
            try {
              const observations = await getWorkflowObservations(
                request.idSolicitud,
              );
              if (active)
                setWorkflowObservations((previous) => ({
                  ...previous,
                  [request.idSolicitud]: observations,
                }));
            } catch (error) {
              if (error?.response?.status !== 404) {
                console.error(
                  `No fue posible cargar observaciones de ${request.idSolicitud}:`,
                  error,
                );
              }
            }
          }),
        );
      } catch (error) {
        console.error("No fue posible cargar la cola del workflow:", error);
      }
    };
    loadWorkflowQueue();
    return () => {
      active = false;
    };
  }, [userData]);

  useEffect(() => {
    if (ownRequests.length > 0) {
      console.log(
        "Mis solicitudes:",
        ownRequests.map((request) => ({
          id: request.idSolicitud,
          etapa: request.etapa_actual,
          nombre: request.nombre_actividad,
          estadoFormularios: request.estadoFormularios,
        })),
      );
    }
  }, [ownRequests]);

  useEffect(() => {
    if (!ownRequests.length) return undefined;
    let active = true;
    const loadRequesterObservations = async () => {
      await Promise.all(
        ownRequests.map(async (request) => {
          if (workflowObservations[request.idSolicitud]) return;
          try {
            const observations = await getWorkflowObservations(
              request.idSolicitud,
            );
            if (active) {
              setWorkflowObservations((previous) => ({
                ...previous,
                [request.idSolicitud]: observations,
              }));
            }
          } catch (error) {
            if (error?.response?.status !== 404) {
              console.error(
                `No fue posible cargar observaciones de ${request.idSolicitud}:`,
                error,
              );
            }
          }
        }),
      );
    };
    loadRequesterObservations();
    return () => {
      active = false;
    };
  }, [ownRequests, workflowObservations]);

  const handleCreateNewRequest = async () => {
    try {
      console.log("🆕 Solicitando nuevo ID de solicitud...");
      localStorage.removeItem("id_solicitud");
      localStorage.removeItem("formData");

      const response = await axios.get(`${API_URL}/getLastId`, {
        params: { sheetName: "SOLICITUDES" }, // Asegurar que esté consultando la hoja correcta
      });
      console.log("Respuesta de getLastId:", response.data);

      if (!response.data || response.status !== 200) {
        throw new Error("Respuesta inesperada del servidor.");
      }
      // Generar un nuevo ID sumando 1 al último ID registrado
      const nuevoId = (response.data.lastId || 0) + 1;
      console.log(`✅ Nuevo ID generado: ${nuevoId}`);
      //  Guardar el nuevo ID en localStorage
      localStorage.setItem("id_solicitud", nuevoId);

      //Insertar la nueva fila en Google Sheets para registrar la solicitud
      await axios.post(`${API_URL}/createNewRequest`, {
        id_solicitud: nuevoId,
        fecha_solicitud: new Date().toISOString().split("T")[0], // Fecha actual
        nombre_actividad: "",
        nombre_solicitante: userData.name, // Nombre del usuario autenticado
        dependencia_tipo: "",
        nombre_dependencia: "",
      });

      // Bloquea el primer "Siguiente" durante 1 minuto tras crear la solicitud.
      const initialCooldownUntil = Date.now() + 60 * 1000;
      localStorage.setItem(
        `form1_nextCooldownUntil_${nuevoId}`,
        String(initialCooldownUntil),
      );

      console.log(`✅ Nueva solicitud guardada con ID: ${nuevoId}`);

      //Redirigir al usuario al formulario de la solicitud creada
      navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`);
    } catch (error) {
      console.error("🚨 Error al generar el ID de la solicitud:", error);
      alert(
        "Hubo un problema al crear la nueva solicitud. Inténtalo de nuevo.",
      );
    }
  };

  const handleNavigateToForm = async (
    request,
    formNumber,
    readOnly = false,
  ) => {
    if (isAtOrPastFirmas(request)) {
      return handleDownloadFormPdf(request, formNumber);
    }
    try {
      const { idSolicitud } = request;

      // Limpiar localStorage antes de la navegación
      localStorage.removeItem("formData");
      localStorage.setItem("id_solicitud", idSolicitud);

      // Obtener datos actualizados de la solicitud
      console.log(
        `🔎 Cargando datos para solicitud ${idSolicitud}, formulario ${formNumber}`,
      );
      const response = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: idSolicitud },
      });

      if (response.status === 200 && response.data) {
        // Guardar los datos actualizados en localStorage
        const solicitudData = flattenSolicitudResponse(response.data);
        const solicitudMeta = response.data?.SOLICITUDES || solicitudData;
        const etapaActual = Number(solicitudMeta?.etapa_actual || 0);
        const pasoActual = Number(solicitudMeta?.paso || 0);
        const pasoDestino = formNumber === etapaActual ? pasoActual : 0;
        localStorage.setItem("formData", JSON.stringify(solicitudData));
        console.log(
          `✅ Datos cargados correctamente para solicitud ${idSolicitud}`,
        );

        // Navegar al formulario
        navigate(
          `/formulario/${formNumber}?solicitud=${idSolicitud}&paso=${pasoDestino}&etapa=${encodeURIComponent(request.etapa_codigo || request.etapa_actual || "")}${readOnly ? "&readOnly=1" : ""}`,
        );
      } else {
        throw new Error("No se encontraron datos para esta solicitud");
      }
    } catch (error) {
      console.error("Error al cargar los datos de la solicitud:", error);
      alert(
        "Hubo un problema al cargar los datos de la solicitud seleccionada.",
      );
    }
  };

  const formNames = [
    "Aprobación",
    "Presupuesto",
    "Matriz de riesgos",
    "Mercadeo",
  ];

  const getButtonState = (request, formNumber, { isReceived = false } = {}) => {
    const currentStage = Number(request.etapa_actual) || 0;
    const currentForm = formNumber === currentStage;

    // Verificar el estado específico de este formulario
    const formStatus = resolveFormStatus(request, formNumber) || "En progreso";
    const normalizedStatus = normalizeStatusForMatch(formStatus);
    const isThisFormCompleted = isCompletedStatus(formStatus);
    const isApproved = normalizedStatus === "aprobado";
    const isInReview = normalizedStatus === "enviado a revision";
    const isCorrections = isCorrectionsStatus(formStatus);
    const isInProgress = normalizedStatus === "en progreso";

    const blockedForOwner =
      !isAdmin && !isReceived && isLockedForOwner(formStatus);

    if (!isReceived && !isAdmin && getRequestStage(request) === "solicitud") {
      return {
        formEnabled: true,
        reportEnabled: true,
        formColor:
          isCompletedStatus(formStatus) || isApproved ? "#1976d2" : "#90caf9",
        reportColor: "#f0611a",
        cursor: "pointer",
        progress: isCompletedStatus(formStatus) || isApproved ? 100 : 50,
      };
    }

    if (isApproved) {
      return {
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: true,
        formColor: "#2e7d32",
        reportColor: "#f0611a",
        cursor: blockedForOwner ? "not-allowed" : "pointer",
        progress: 100,
      };
    }

    if (isInReview) {
      return {
        formEnabled: isAdmin || isReceived,
        reportEnabled: isAdmin || isReceived,
        formColor: "#f9a825",
        reportColor: "#f0611a",
        cursor: isAdmin || isReceived ? "pointer" : "not-allowed",
        progress: 100,
      };
    }

    if (isCorrections) {
      return {
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: isReceived,
        formColor: "#ef6c00",
        reportColor: isReceived ? "#f0611a" : "#e0e0e0",
        cursor: isReceived || !blockedForOwner ? "pointer" : "not-allowed",
        progress: 100,
      };
    }

    if (isInProgress) {
      return {
        formEnabled: !isReceived,
        reportEnabled: false,
        formColor: isReceived ? "#e0e0e0" : "#90caf9",
        reportColor: "#e0e0e0",
        cursor: isReceived ? "not-allowed" : "pointer",
        progress: 50,
      };
    }

    const isCurrentFormComplete = isFormCompleted(request, formNumber);
    const isPast = formNumber < currentStage;
    const isCompleted =
      isFormCompleted(request, formNumber) || isThisFormCompleted;

    // Lógica para solicitudes en creación
    if (isCurrentFormComplete || isPast || isThisFormCompleted) {
      return {
        // Los revisores pueden consultar y descargar formularios completados
        // en modo lectura, aunque no puedan editarlos.
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: isCompleted,
        formColor: "#1976d2",
        reportColor: isCompleted ? "#f0611a" : "#e0e0e0",
        cursor: "pointer",
        progress: 100,
      };
    } else if (currentForm) {
      // Permitir continuar desde el boton del formulario en curso.
      return {
        formEnabled: true,
        reportEnabled: false,
        formColor: "#90caf9",
        reportColor: "#e0e0e0",
        cursor: "pointer",
        progress: 50,
      };
    } else {
      const allowDirectFormAccess = !isReceived;

      // Permitir acceso directo por boton de formulario cuando es solicitud propia.
      return {
        formEnabled: allowDirectFormAccess,
        reportEnabled: false,
        formColor: allowDirectFormAccess ? "#bcd7f6" : "#e0e0e0",
        reportColor: "#e0e0e0",
        cursor: allowDirectFormAccess ? "pointer" : "not-allowed",
        progress: allowDirectFormAccess ? 10 : 0,
      };
    }
  };

  function isFormCompleted(request, formNumber) {
    const normalizedStatus = normalizeStatusForMatch(
      resolveFormStatus(request, formNumber),
    );
    if (
      isCompletedStatus(normalizedStatus) ||
      normalizedStatus === "aprobado"
    ) {
      return true;
    }

    // 1. Verificar primero si está marcado explícitamente como completado
    if (isCompletedStatus(request[`estado_formulario_${formNumber}`])) {
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
      const maxSteps = { 1: 5, 2: 3, 3: 5, 4: 5 };
      return request.paso >= maxSteps[formNumber];
    }

    // 5. Los formularios futuros nunca están completos excepto si están explícitamente marcados
    return false;
  }

  const handleDownloadFormReport = async (request, formNumber) => {
    if (isAtOrPastFirmas(request)) {
      return handleDownloadFormPdf(request, formNumber);
    }
    const key = `${request.idSolicitud}-${formNumber}`;
    setLoadingReports((prev) => ({ ...prev, [key]: true }));
    try {
      const { idSolicitud } = request;
      if (!idSolicitud || !formNumber) {
        alert("No se puede descargar el informe porque falta información.");
        setLoadingReports((prev) => ({ ...prev, [key]: false }));
        return;
      }
      await downloadFormReport(idSolicitud, formNumber);
    } catch (error) {
      alert("Hubo un problema al descargar el reporte. Inténtalo de nuevo.");
      console.error("Error al descargar el reporte:", error);
    } finally {
      setLoadingReports((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getRequestTotalHours = async (request) => {
    const directHours = Number(
      request?.total_horas ??
        request?.totalHoras ??
        request?.SOLICITUDES?.total_horas,
    );
    if (!Number.isNaN(directHours) && directHours > 0) {
      return directHours;
    }

    try {
      const response = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: request.idSolicitud },
      });
      const solicitudData = flattenSolicitudResponse(response.data);
      const fetchedHours = Number(
        solicitudData?.total_horas ?? solicitudData?.totalHoras,
      );
      return Number.isNaN(fetchedHours) ? 0 : fetchedHours;
    } catch (error) {
      console.warn(
        "No fue posible obtener total_horas para validacion de revision:",
        error,
      );
      return 0;
    }
  };

  useEffect(() => {
    let active = true;
    const loadTotalHours = async () => {
      const entries = await Promise.all(
        ownRequests.map(async (request) => [
          request.idSolicitud,
          await getRequestTotalHours(request),
        ]),
      );
      if (active)
        setTotalHoursByRequest((previous) => ({
          ...previous,
          ...Object.fromEntries(entries),
        }));
    };
    if (ownRequests.length) loadTotalHours();
    return () => {
      active = false;
    };
  }, [ownRequests]);

  const requiresRiskMatrix = (request) => {
    const directValue =
      totalHoursByRequest[request.idSolicitud] ??
      request.total_horas ??
      request.totalHoras ??
      request.SOLICITUDES?.total_horas;
    return Number(directValue) >= 16;
  };

  const isFormSelectableForReview = (request, formNumber) => {
    const formStatus = resolveFormStatus(request, formNumber);
    const normalized = normalizeStatusForMatch(formStatus);
    if (normalized === "aprobado") {
      return false;
    }

    if (
      !normalized ||
      ["en progreso", "pendiente", "borrador", "no iniciado"].includes(normalized)
    ) {
      return false;
    }

    const stageState = String(request?.estado_etapa || "")
      .trim()
      .toLowerCase();
    const isReturned =
      stageState === "devuelta" ||
      stageState === "requiere_correcciones" ||
      hasCorrectionsInRequest(request);
    if (isReturned) {
      return (
        isFormCompleted(request, formNumber) ||
        normalized === "completado" ||
        normalized === "enviado a revision" ||
        isCorrectionsStatus(formStatus)
      );
    }

    if (normalized === "enviado a revision") {
      return false;
    }

    if (isCorrectionsStatus(formStatus)) {
      return true;
    }

    return isFormCompleted(request, formNumber) || normalized === "completado";
  };

  const areRequiredFormsComplete = (request) => {
    if (isRequestInCorrection(request)) {
      return true;
    }
    return [1, 2, ...(requiresRiskMatrix(request) ? [3] : [])].every(
      (formNumber) => {
        const status = normalizeStatusForMatch(
          resolveFormStatus(request, formNumber),
        );
        return status === "completado" || status === "aprobado";
      },
    );
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

  const handleSendSelectedFormsToReview = async (
    request,
    submitAllCompleted = false,
  ) => {
    const requestId = request.idSolicitud;
    const pendingObservations = getPendingObservations(
      getRequestObservations(request),
    );
    if (pendingObservations.length > 0) {
      alert(
        "Debes marcar como corregidas todas las observaciones antes de reenviar la solicitud a revisión.",
      );
      return;
    }
    const selectedMap = selectedFormsByRequest[requestId] || {};
    const selectedForms = (
      submitAllCompleted
        ? [1, 2, 3, 4].map(String).map((formNumber) => [formNumber, true])
        : Object.entries(selectedMap)
    )
      .filter(([formNumber, isSelected]) => {
        if (!isSelected) return false;
        return isFormSelectableForReview(request, Number(formNumber));
      })
      .map(([formNumber]) => Number(formNumber));

    if (selectedForms.length === 0) {
      alert("Seleccione al menos un formulario para enviar a revision.");
      return;
    }

    const normalizedStatus1 = normalizeStatusForMatch(
      resolveFormStatus(request, 1),
    );
    const normalizedStatus2 = normalizeStatusForMatch(
      resolveFormStatus(request, 2),
    );
    const normalizedStatus3 = normalizeStatusForMatch(
      resolveFormStatus(request, 3),
    );

    const stageState = String(request?.estado_etapa || "")
      .trim()
      .toLowerCase();
    const isReturned =
      stageState === "devuelta" ||
      stageState === "requiere_correcciones" ||
      hasCorrectionsInRequest(request);
    const isAlreadySatisfied = (normalizedStatus) =>
      normalizedStatus === "aprobado" ||
      normalizedStatus === "enviado a revision" ||
      (isReturned &&
        (isCorrectionsStatus(normalizedStatus) ||
          normalizedStatus === "completado"));

    const form1Satisfied =
      selectedForms.includes(1) || isAlreadySatisfied(normalizedStatus1);
    const form2Satisfied =
      selectedForms.includes(2) || isAlreadySatisfied(normalizedStatus2);

    if (!form1Satisfied || !form2Satisfied) {
      if (!form1Satisfied && !form2Satisfied) {
        alert(
          "Para enviar a revision debe incluir los formularios 1 y 2, salvo que ya esten aprobados o enviados a revision.",
        );
      } else if (!form1Satisfied) {
        alert(
          "Para enviar a revision debe incluir el formulario 1, salvo que ya este aprobado o enviado a revision.",
        );
      } else {
        alert(
          "Para enviar a revision debe incluir el formulario 2, salvo que ya este aprobado o enviado a revision.",
        );
      }
      return;
    }

    const totalHoras = await getRequestTotalHours(request);
    const form3Satisfied =
      selectedForms.includes(3) || isAlreadySatisfied(normalizedStatus3);
    if (totalHoras >= 16 && !form3Satisfied) {
      alert(
        "Como el total de horas de la actividad es mayor o igual a 16, el formulario 3 es obligatorio para enviar a revision.",
      );
      return;
    }

    setBulkReviewLoadingByRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await sendFormsToRevision({
        id_solicitud: requestId,
        userId: userData.id,
        formularios: selectedForms,
        etapa_anterior: request?.etapa_anterior || "",
      });

      if (response?.success) {
        const responseData = response.data?.data || response.data || response;
        const nextStage =
          responseData.etapa_codigo ||
          responseData.etapaCodigo ||
          responseData.ETAPAS?.etapa_codigo ||
          responseData.etapas?.etapa_codigo ||
          request.etapa_anterior ||
          "revision_1";
        const nextRole =
          responseData.rol_responsable ||
          responseData.rolResponsable ||
          (nextStage === "revision_2" ? "revisor_2" : "revisor_1");
        const responseStatuses = extractEstadoFormularios(responseData);

        setOwnRequests((prev) =>
          prev.map((item) => {
            if (String(item.idSolicitud) !== String(requestId)) {
              return item;
            }

            const nextStatuses = { ...(item.estadoFormularios || {}) };
            selectedForms.forEach((formNumber) => {
              nextStatuses[String(formNumber)] = "Enviado a revision";
            });

            return {
              ...item,
              estadoFormularios:
                Object.keys(responseStatuses).length > 0
                  ? responseStatuses
                  : nextStatuses,
              etapa_codigo: nextStage,
              etapa_actual: nextStage === "revision_2" ? 3 : 2,
              rol_responsable: nextRole,
              estado_etapa: "pendiente",
              estado: "Enviado a revision",
              etapa_anterior: "solicitud",
            };
          }),
        );

        setSelectedFormsByRequest((prev) => ({ ...prev, [requestId]: {} }));
        alert("Formularios seleccionados enviados a revision correctamente.");
        if (typeof fetchRequests === "function") {
          fetchRequests();
        }
      }
    } catch (error) {
      console.error(
        "Error al enviar formularios seleccionados a revision:",
        error,
      );
      alert(
        error?.response?.data?.message ||
          "No se pudieron enviar los formularios seleccionados a revision.",
      );
    } finally {
      setBulkReviewLoadingByRequest((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  const getReviewerStage = (role) =>
    ({
      revisor_1: "revision_1",
      revisor_2: "revision_2",
      presupuesto: "presupuesto",
    })[String(role || "").toLowerCase()] || "";

  const isDecanatoCloser = (request) =>
    getRequestStage(request) === "decanato" &&
    ["decanato", "revisor_1", "revisor_2"].includes(
      String(userData?.role || "").toLowerCase(),
    );

  const loadRequestObservations = async (requestId) => {
    const observations = await getWorkflowObservations(requestId);
    setWorkflowObservations((previous) => ({
      ...previous,
      [requestId]: observations,
    }));
    return observations;
  };

  const handleLegacyAdminAction = async (request, action) => {
    const requestId = request.idSolicitud;
    const comment = String(reviewComment[requestId] || "").trim();
    if (action !== "approve" && !comment) {
      alert("Escribe una observación antes de devolver la solicitud.");
      return;
    }
    setReviewAction((previous) => ({ ...previous, [requestId]: action }));
    try {
      if (action === "approve") {
        await approveFullRequest({
          id_solicitud: requestId,
          userId: userData.id,
        });
      } else {
        await sendCorrections({
          id_solicitud: requestId,
          userId: userData.id,
          formularios: [1, 2, 3, 4].filter((number) =>
            resolveFormStatus(request, number),
          ),
          comentarios: comment,
          comentarios_por_formulario: { general: comment },
        });
      }
      alert(
        action === "approve"
          ? "Solicitud aprobada correctamente."
          : "Solicitud devuelta con observaciones.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo actualizar la solicitud.",
      );
    } finally {
      setReviewAction((previous) => ({ ...previous, [requestId]: null }));
    }
  };

  const handleObservationStatus = async (request, observation, estado) => {
    if (
      !isRequestInCorrection(request) &&
      !["revisor_1", "revisor_2", "presupuesto", "admin"].includes(
        String(userData?.role || "").toLowerCase(),
      )
    ) {
      alert(
        "No se pueden modificar observaciones una vez reenviada la solicitud.",
      );
      return;
    }
    const actionKey = `${request.idSolicitud}-${observation.id_observacion}`;
    setObservationActionLoading((previous) => ({
      ...previous,
      [actionKey]: true,
    }));
    setWorkflowObservations((previous) => {
      const list = previous[request.idSolicitud] || [];
      return {
        ...previous,
        [request.idSolicitud]: list.map((obs) =>
          obs.id_observacion === observation.id_observacion
            ? { ...obs, estado }
            : obs,
        ),
      };
    });
    try {
      await updateWorkflowObservation(
        request.idSolicitud,
        observation.id_observacion,
        { estado },
      );
      await loadRequestObservations(request.idSolicitud);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "No se pudo actualizar la observación.",
      );
      await loadRequestObservations(request.idSolicitud);
    } finally {
      setObservationActionLoading((previous) => ({
        ...previous,
        [actionKey]: false,
      }));
    }
  };

  /* Edición de observaciones oculta temporalmente
  const handleEditObservation = (request, observation) => {
    setObservationDrafts((previous) => ({
      ...previous,
      [request.idSolicitud]: {
        ...previous[request.idSolicitud],
        text: observation.observacion || "",
        editingId: observation.id_observacion,
      },
    }));
  };

  const handleCancelEditObservation = (requestId) => {
    setObservationDrafts((previous) => ({
      ...previous,
      [requestId]: {},
    }));
  };

  const handleSaveObservationEdit = async (request) => {
    const requestId = request.idSolicitud;
    const draft = observationDrafts[requestId] || {};
    const text = String(draft.text || "").trim();
    if (!draft.editingId || !text) {
      alert("Escribe la observación antes de guardarla.");
      return;
    }
    const actionKey = `${requestId}-${draft.editingId}`;
    setObservationActionLoading((previous) => ({
      ...previous,
      [actionKey]: true,
    }));
    try {
      await updateWorkflowObservation(requestId, draft.editingId, {
        observacion: text,
      });
      setObservationDrafts((previous) => ({
        ...previous,
        [requestId]: {},
      }));
      await loadRequestObservations(requestId);
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo editar la observación.",
      );
    } finally {
      setObservationActionLoading((previous) => ({
        ...previous,
        [actionKey]: false,
      }));
    }
  };
  */

  const getRequestObservations = (request) => {
    const loaded = workflowObservations[request.idSolicitud];
    const list = Array.isArray(loaded)
      ? loaded
      : Object.values(request.comentarios || {}).flatMap((items) =>
          Array.isArray(items) ? items : [],
        );
    return filterActiveObservations(list);
  };

  const handleWorkflowSignature = async (request) => {
    const actionKey = `${request.idSolicitud}-signature`;
    const file = signatureFiles[request.idSolicitud];
    if (!file) {
      alert("Selecciona la imagen de la firma.");
      return;
    }
    setObservationActionLoading((previous) => ({
      ...previous,
      [actionKey]: true,
    }));
    try {
      const response = await registerWorkflowSignature(request.idSolicitud, {
        file,
        observaciones: signatureNotes[request.idSolicitud] || "",
        destinatariosDecanato: String(
          decanatoEmailData[request.idSolicitud]?.destinatarios || "",
        )
          .split(/[;,\n]/)
          .map((email) => email.trim())
          .filter(Boolean),
        asuntoDecanato: decanatoEmailData[request.idSolicitud]?.asunto || "",
        cuerpoDecanato: decanatoEmailData[request.idSolicitud]?.cuerpo || "",
      });
      alert(
        response?.data?.notificacion?.estado === "fallida"
          ? "La firma se registró, pero el correo no pudo enviarse."
          : "Firma registrada correctamente.",
      );
      window.location.reload();
    } catch (error) {
      alert(error?.response?.data?.message || "No se pudo registrar la firma.");
    } finally {
      setObservationActionLoading((previous) => ({
        ...previous,
        [actionKey]: false,
      }));
    }
  };

  const handleSignatureReminder = async (request, tipoFirma) => {
    try {
      const response = await remindWorkflowSignature(
        request.idSolicitud,
        tipoFirma,
      );
      alert(
        response?.data?.notificacion?.estado === "fallida"
          ? "El recordatorio no pudo enviarse."
          : "Recordatorio enviado.",
      );
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo enviar el recordatorio.",
      );
    }
  };

  const handleSendToPresupuesto = async (request) => {
    const requestId = request?.idSolicitud;
    if (!requestId || sendingPresupuestoId === requestId) return;
    setSendingPresupuestoId(requestId);
    try {
      const response = await sendWorkflowRequestToPresupuesto(requestId);
      alert(
        response?.data?.notificaciones_presupuesto?.some(
          (item) => item.estado === "fallida",
        )
          ? "La solicitud pasó a Presupuesto, pero uno o más correos fallaron."
          : "Solicitud enviada a Presupuesto correctamente.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "No se pudo enviar la solicitud a Presupuesto.",
      );
    } finally {
      setSendingPresupuestoId(null);
    }
  };

  const handleOpenSendToDecanato = (request) => {
    const id = request.idSolicitud;
    if (!decanatoEmailData[id]?.asunto && !decanatoEmailData[id]?.cuerpo) {
      setDecanatoEmailData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          asunto: `[Extensión] Solicitud #${id} aprobada en Presupuesto y remitida a Decanato - ${request.nombreActividad || ""}`,
          cuerpo: `Cordial saludo.\n\nPor medio del presente correo se remite para su conocimiento, revisión final y expedición de resolución la solicitud de extensión #${id} ("${request.nombreActividad || ""}"), presentada por ${request.nombreSolicitante || "el solicitante"}.\n\nLa solicitud ya completó las revisiones de Extensión, cuenta con las firmas institucionales completas (Solicitante y Director de Escuela) y recibió el visto bueno en la etapa de Presupuesto. Se adjuntan los formularios oficiales debidamente diligenciados y firmados en formato PDF.\n\nAgradecemos su oportuna atención.`,
        },
      }));
    }
    setSendDecanatoRequest(request);
  };

  const handleSendToDecanato = async () => {
    if (!sendDecanatoRequest || sendingDecanato) return;
    const requestId = sendDecanatoRequest.idSolicitud;
    const data = decanatoEmailData[requestId] || {};
    setSendingDecanato(true);
    try {
      const response = await sendWorkflowRequestToDecanato(requestId, {
        destinatariosDecanato: String(data.destinatarios || "")
          .split(/[;,\n]/)
          .map((email) => email.trim())
          .filter(Boolean),
        asuntoDecanato: data.asunto || "",
        cuerpoDecanato: data.cuerpo || "",
      });
      const failed = (response?.data?.notificaciones_decanato || []).some(
        (notification) => notification.estado === "fallida",
      );
      setSendDecanatoRequest(null);
      alert(
        failed
          ? "La solicitud pasó a Decanato, pero uno o más correos fallaron."
          : "Solicitud enviada a Decanato correctamente.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudo enviar la solicitud a Decanato.",
      );
    } finally {
      setSendingDecanato(false);
    }
  };

  const handleDecanatoClosure = async (request) => {
    const data = decanatoData[request.idSolicitud] || {};
    const resultado = data.resultado || "Aprobada";
    const resolucion = String(data.resolucion || "").trim();
    if (!resolucion) {
      alert("La resolución es obligatoria para cerrar la solicitud.");
      return;
    }
    try {
      await submitDecanatoCut({
        idSolicitud: request.idSolicitud,
        resultado,
        resolucion,
        observaciones: data.observaciones || "",
        pdfResolucion: data.pdf,
      });
      alert("Solicitud cerrada correctamente.");
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo cerrar la solicitud.",
      );
    }
  };

  const handleDeleteObservation = async (request, observation) => {
    const actionKey = `${request.idSolicitud}-${observation.id_observacion}`;
    if (!window.confirm("¿Deseas desechar/eliminar esta observación?")) return;
    setObservationActionLoading((previous) => ({
      ...previous,
      [actionKey]: true,
    }));
    try {
      await deleteWorkflowObservation(
        request.idSolicitud,
        observation.id_observacion,
      );
      setWorkflowObservations((previous) => {
        const list = previous[request.idSolicitud] || [];
        return {
          ...previous,
          [request.idSolicitud]: list.filter(
            (item) => item.id_observacion !== observation.id_observacion,
          ),
        };
      });
      await loadRequestObservations(request.idSolicitud);
    } catch (error) {
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "No se pudo eliminar la observación.",
      );
    } finally {
      setObservationActionLoading((previous) => ({
        ...previous,
        [actionKey]: false,
      }));
    }
  };

  const handleWorkflowReviewerAction = async (request, action) => {
    const requestId = request.idSolicitud;
    const reviewerStage = getReviewerStage(userData.role);
    const currentStage = getRequestStage(request);
    const comment = String(reviewComment[requestId] || "").trim();
    if (!reviewerStage || currentStage !== reviewerStage) return;
    setReviewAction((prev) => ({ ...prev, [requestId]: action }));
    try {
      const workflowAction = action === "return" ? "devolver" : "aprobar";
      await submitWorkflowDecision(requestId, {
        accion: workflowAction,
        comentario: comment,
        comentarios_por_formulario: comment ? { general: comment } : {},
      });
      alert(
        action === "approve"
          ? userData.role === "revisor_1"
            ? "Solicitud enviada a Revisión 2."
            : userData.role === "revisor_2"
              ? "Solicitud aprobada y enviada a Firmas."
              : userData.role === "presupuesto"
                ? "Solicitud aprobada y enviada a Decanato."
                : "Etapa aprobada."
          : "Solicitud devuelta con observaciones.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo actualizar la revisión.",
      );
    } finally {
      setReviewAction((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  if (!userData || !userData.id) {
    return <div>Cargando...</div>;
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ padding: "20px", marginTop: "0", textAlign: "center" }}>
          <CircularProgress />
        </div>
      </ThemeProvider>
    );
  }

  const flowStages = [
    [
      "Solicitud",
      "El solicitante diligencia y envía los formularios.",
      "Solicitante",
    ],
    [
      "Revisión 1",
      "Validación inicial por Extensión.",
      "Revisor 1 de Extensión",
    ],
    [
      "Revisión 2",
      "Verificación de correcciones y requisitos.",
      "Revisor 2 de Extensión",
    ],
    ["Firmas", "Firma del solicitante y director.", "Solicitante y director"],
    ["Presupuesto", "Revisión financiera.", "Presupuesto"],
    [
      "En Decanato",
      "Envío al corte y decisión institucional.",
      "Decanato, Revisor 1 o Revisor 2",
    ],
    ["Finalizado", "Solicitud aprobada o rechazada.", "Proceso finalizado"],
  ];

  const getFlowIndex = (request) => {
    if (isRequestInCorrection(request)) {
      return 0;
    }
    const stageIndex = {
      solicitud: 0,
      revision_1: 1,
      revision_2: 2,
      firmas: 3,
      presupuesto: 4,
      decanato: 5,
      finalizado: 6,
    };
    const explicitStage = getRequestStage(request);
    if (stageIndex[explicitStage] !== undefined)
      return stageIndex[explicitStage];
    const numericStage = Number(request.etapa_actual);
    if (
      Number.isInteger(numericStage) &&
      numericStage >= 0 &&
      numericStage <= stageIndex.finalizado
    ) {
      return numericStage;
    }
    const statuses = Object.values(request.estadoFormularios || {}).map(
      normalizeStatusForMatch,
    );
    if (statuses.some((s) => s.includes("requiere correccion"))) return 0;
    if (statuses.some((s) => s === "aprobado")) return 4;
    if (statuses.some((s) => s === "enviado a revision")) return 1;
    if (statuses.every((s) => s === "completado") && statuses.length) return 1;
    return 0;
  };

  const isAtOrPastFirmas = (request) => {
    if (isRequestInCorrection(request)) return false;
    const flowIdx = getFlowIndex(request);
    const stage = getRequestStage(request);
    return (
      flowIdx >= 3 ||
      ["firmas", "presupuesto", "decanato", "finalizado"].includes(stage)
    );
  };

  const handleDownloadFormPdf = async (request, formNumber) => {
    const key = `${request.idSolicitud}-${formNumber}-pdf-download`;
    setLoadingReports((prev) => ({ ...prev, [key]: true }));
    try {
      await getWorkflowFormPdf(request.idSolicitud, formNumber, {
        download: true,
      });
    } catch (error) {
      alert(
        "Hubo un problema al descargar el PDF del formulario: " +
          (error?.response?.data?.error || error.message),
      );
    } finally {
      setLoadingReports((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderPdfDownloadButton = (request, formNumber) => {
    const key = `${request.idSolicitud}-${formNumber}-pdf-download`;
    return (
      <Tooltip title="Descargar PDF">
        <span>
          <Button
            size="small"
            variant="outlined"
            aria-label="Descargar PDF"
            onClick={() => handleDownloadFormPdf(request, formNumber)}
            disabled={Boolean(loadingReports[key])}
          >
            {loadingReports[key] ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadOutlined fontSize="small" />
            )}
          </Button>
        </span>
      </Tooltip>
    );
  };

  const renderWorkflowHistory = (request, keyPrefix = "history") =>
    request.historial?.length > 0 && (
      <details className="workflow-history">
        <summary>Historial de movimientos ({request.historial.length})</summary>
        <div className="workflow-history__list">
          {request.historial.map((entry, index) => (
            <div
              className="workflow-history__item"
              key={
                entry.id_historial ||
                `${request.idSolicitud}-${keyPrefix}-${index}`
              }
            >
              <CheckCircle className="workflow-history__icon" />
              <div className="workflow-history__content">
                <div className="workflow-history__top">
                  <strong>
                    {formatHistoryAction(entry.accion)} ·{" "}
                    {getHistoryActorName(entry)}
                  </strong>
                  <span className="workflow-history__stage">
                    {formatHistoryStage(entry.etapa, entry.accion)}
                  </span>
                </div>
                <span className="workflow-history__meta">
                  {formatHistoryDate(entry.fecha)} ·{" "}
                  {formatHistoryRole(entry.rol_actor)}
                </span>
                {entry.comentario && <small>{entry.comentario}</small>}
              </div>
            </div>
          ))}
        </div>
      </details>
    );

  const renderSignaturePreviewGrid = (request) => {
    const hasDirectorSignature =
      request.firma_director === true ||
      String(request.firma_director) === "true" ||
      Boolean(request.firma_director_info);
    if (!hasDirectorSignature) return null;

    const hasSolicitanteSignature =
      request.firma_solicitante === true ||
      String(request.firma_solicitante) === "true" ||
      Boolean(request.firma_solicitante_info);
    const directorInfo = request.firma_director_info || {};
    const solicitanteInfo = request.firma_solicitante_info || {};

    return (
      <Box className="workflow-signatures-preview">
        <Typography variant="subtitle2" color="primary">
          Firmas registradas
        </Typography>
        <div className="workflow-signatures-grid">
          <div className="workflow-signature-card">
            <Typography variant="body2" fontWeight={700}>
              Firma del Director de Escuela
            </Typography>
            <div className="workflow-signature-card__preview">
              <SignatureImagePreview
                idSolicitud={request.idSolicitud}
                tipoFirma="director_escuela"
                alt="Firma del director de escuela"
              />
            </div>
            <div className="workflow-signature-card__meta">
              <Typography variant="body2" fontWeight={600}>
                {directorInfo.nombre_firmante || "Director de Escuela"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Subida: {formatSignatureDateTime(directorInfo.fecha_firma)}
              </Typography>
            </div>
          </div>

          <div className="workflow-signature-card">
            <Typography variant="body2" fontWeight={700}>
              Firma del Solicitante
            </Typography>
            {hasSolicitanteSignature ? (
              <>
                <div className="workflow-signature-card__preview">
                  <SignatureImagePreview
                    idSolicitud={request.idSolicitud}
                    tipoFirma="solicitante"
                    alt="Firma del solicitante"
                  />
                </div>
                <div className="workflow-signature-card__meta">
                  <Typography variant="body2" fontWeight={600}>
                    {solicitanteInfo.nombre_firmante ||
                      request.nombre_solicitante ||
                      "Solicitante"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subida:{" "}
                    {formatSignatureDateTime(solicitanteInfo.fecha_firma)}
                  </Typography>
                </div>
              </>
            ) : (
              <div className="workflow-signature-card__preview">
                <Typography variant="caption" color="text.secondary">
                  Pendiente de firma del solicitante
                </Typography>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  };

  const renderRequesterStages = (request) => {
    const currentStage = getFlowIndex(request);
    const riskMatrixRequired = requiresRiskMatrix(request);
    const requestObservations = getRequestObservations(request);
    const pendingObservations = getPendingObservations(requestObservations);
    const getStageDate = (stageIndex) => {
      const stageKeys =
        [
          ["solicitud", "solicitud"],
          ["revision_1", "revisión 1", "revision 1"],
          ["revision_2", "revisión 2", "revision 2"],
          ["firmas", "firma"],
          ["presupuesto"],
          ["decanato", "en decanato"],
          ["finalizado", "finalizado"],
        ][stageIndex] || [];
      const historyEntry = (request.historial || [])
        .filter((entry) => {
          const historyStage = normalizeStatusForMatch(entry?.etapa);
          return stageKeys.some((key) => historyStage.includes(key));
        })
        .sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0))
        .at(-1);
      return historyEntry?.fecha
        ? ` · Fecha: ${formatHistoryDate(historyEntry.fecha)}`
        : "";
    };
    const stages = [
      {
        name: "Solicitud",
        description: "Diligenciamiento y envío de los formularios.",
        content:
          "Aquí puedes completar tus formularios y enviarlos a revisión.",
      },
      {
        name: "Revisión 1",
        description: "Validación inicial por Extensión.",
        content: "Esta etapa está a cargo del primer revisor de Extensión.",
      },
      {
        name: "Revisión 2",
        description: "Verificación de la solicitud y correcciones.",
        content: "Esta etapa está a cargo del segundo revisor de Extensión.",
      },
      {
        name: "Firmas",
        description: "Firma del solicitante y del director.",
        content: "La solicitud requiere las firmas correspondientes.",
      },
      {
        name: "Presupuesto",
        description: "Revisión financiera.",
        content:
          "Presupuesto revisa la información financiera de la solicitud.",
      },
      {
        name: "Decanato",
        description: "Envío al corte y decisión institucional.",
        content: "La solicitud se presenta en el corte de Decanato.",
      },
      {
        name: "Finalizado",
        description: "Resultado de la solicitud.",
        content: request.estado_general || "La solicitud aún no ha finalizado.",
      },
    ];

    return (
      <Box className="requester-stages">
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Seguimiento de la solicitud
        </Typography>
        <Stepper activeStep={currentStage} orientation="vertical">
          {stages.map((stage, index) => {
            const isCurrent = index === currentStage;
            const isPast = index < currentStage;
            return (
              <Step
                key={stage.name}
                completed={isPast}
                className={`requester-stage ${
                  isPast
                    ? "requester-stage--completed"
                    : isCurrent
                      ? "requester-stage--current"
                      : "requester-stage--pending"
                }`}
              >
                <StepLabel
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {stage.description} · Responsable:{" "}
                      {
                        [
                          "Solicitante",
                          "Revisor 1 de Extensión",
                          "Revisor 2 de Extensión",
                          "Solicitante y director",
                          "Presupuesto",
                          "Decanato, Revisor 1 o Revisor 2",
                          "Proceso finalizado",
                        ][index]
                      }
                      {getStageDate(index)}
                    </Typography>
                  }
                >
                  {stage.name}
                </StepLabel>
                <StepContent>
                  <Accordion
                    className={`stage-detail ${isCurrent ? "stage-detail--current" : ""}`}
                    disableGutters
                    elevation={0}
                    defaultExpanded={isCurrent}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>
                        {isCurrent
                          ? "Etapa actual"
                          : isPast
                            ? "Etapa completada"
                            : "Etapa pendiente"}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {index === currentStage ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                          >
                            {stage.content}
                          </Typography>
                          {currentStage === 6 ? (
                            renderReceivedStageContent(
                              request,
                              6,
                              currentStage,
                              true,
                            )
                          ) : (
                            <>
                              <Typography
                                variant="subtitle2"
                                color="primary"
                                sx={{ mb: 1 }}
                              >
                                Formularios de la solicitud
                              </Typography>
                              <Stack className="requester-forms" spacing={1}>
                                {[1, 2, 3, 4]
                                  .filter(
                                    (formNumber) =>
                                      currentStage === 0 ||
                                      currentStage === 6 ||
                                      isFormCompleted(request, formNumber),
                                  )
                                  .map((formNumber) => {
                                    const status =
                                      resolveFormStatus(request, formNumber) ||
                                      "En progreso";
                                    const state = getButtonState(
                                      request,
                                      formNumber,
                                    );
                                    const readOnly = currentStage > 0;
                                    return (
                                      <Box
                                        className="requester-form"
                                        key={`${request.idSolicitud}-stage-${formNumber}`}
                                      >
                                        <Box>
                                          <Stack
                                            direction="row"
                                            spacing={0.75}
                                            alignItems="center"
                                            flexWrap="wrap"
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight={600}
                                            >
                                              {formNames[formNumber - 1]}
                                            </Typography>
                                            <Chip
                                              size="small"
                                              variant="outlined"
                                              color={
                                                formNumber <= 2 ||
                                                (formNumber === 3 &&
                                                  riskMatrixRequired)
                                                  ? "warning"
                                                  : "default"
                                              }
                                              label={
                                                formNumber <= 2 ||
                                                (formNumber === 3 &&
                                                  riskMatrixRequired)
                                                  ? "Obligatorio"
                                                  : "Opcional"
                                              }
                                            />
                                          </Stack>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {status}
                                          </Typography>
                                        </Box>
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          className="requester-form__actions"
                                        >
                                          {isAtOrPastFirmas(request) ? (
                                            renderPdfDownloadButton(
                                              request,
                                              formNumber,
                                            )
                                          ) : (
                                            <>
                                              <Tooltip title="Abrir formulario">
                                                <span>
                                                  <Button
                                                    size="small"
                                                    variant="contained"
                                                    aria-label="Abrir formulario"
                                                    disabled={
                                                      !state.formEnabled
                                                    }
                                                    onClick={() =>
                                                      handleNavigateToForm(
                                                        request,
                                                        formNumber,
                                                        readOnly,
                                                      )
                                                    }
                                                  >
                                                    <VisibilityOutlined fontSize="small" />
                                                  </Button>
                                                </span>
                                              </Tooltip>
                                              {state.reportEnabled && (
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  aria-label="Descargar formulario"
                                                  disabled={
                                                    loadingReports[
                                                      `${request.idSolicitud}-${formNumber}`
                                                    ]
                                                  }
                                                  title={
                                                    String(
                                                      userData?.role || "",
                                                    ).toLowerCase() ===
                                                    "solicitante"
                                                      ? "Generar reporte"
                                                      : "Descargar"
                                                  }
                                                  onClick={() =>
                                                    handleDownloadFormReport(
                                                      request,
                                                      formNumber,
                                                    )
                                                  }
                                                >
                                                  {loadingReports[
                                                    `${request.idSolicitud}-${formNumber}`
                                                  ] ? (
                                                    <>
                                                      <CircularProgress
                                                        size={16}
                                                        color="inherit"
                                                        sx={{ mr: 0.5 }}
                                                      />
                                                      Cargando...
                                                    </>
                                                  ) : (
                                                    <DownloadOutlined fontSize="small" />
                                                  )}
                                                </Button>
                                              )}
                                            </>
                                          )}
                                        </Stack>
                                      </Box>
                                    );
                                  })}
                              </Stack>
                              {isRequestInCorrection(request) &&
                                requestObservations.length > 0 && (
                                  <div className="workflow-observations">
                                    <Typography variant="body2" fontWeight={600}>
                                      Observaciones de la revisión
                                    </Typography>
                                    {requestObservations.map((observation) => {
                                      const hasFormAndStep = Boolean(
                                        observation.formulario && observation.paso,
                                      );
                                      const targetStepIndex = hasFormAndStep
                                        ? Math.max(
                                            0,
                                            parseInt(observation.paso, 10) - 1,
                                          )
                                        : 0;
                                      const stageCode =
                                        request.etapa_codigo ||
                                        request.etapa_actual ||
                                        getRequestStage(request) ||
                                        "";
                                      const stageState = String(
                                        request.estado_etapa || "",
                                      )
                                        .trim()
                                        .toLowerCase();
                                      const canEdit =
                                        (getRequestStage(request) === "solicitud" ||
                                          String(
                                            request.etapa_codigo || "",
                                          ).toLowerCase() === "solicitud") &&
                                        [
                                          "devuelta",
                                          "requiere_correcciones",
                                          "borrador",
                                        ].includes(stageState);
                                      const shouldReadOnly = !canEdit;
                                      const targetUrl = hasFormAndStep
                                        ? `/formulario/${observation.formulario}?solicitud=${request.idSolicitud}&paso=${targetStepIndex}&etapa=${encodeURIComponent(stageCode)}${shouldReadOnly ? "&readOnly=1" : ""}`
                                        : null;

                                      return (
                                        <div
                                          className="workflow-observation"
                                          role={
                                            hasFormAndStep ? "button" : undefined
                                          }
                                          tabIndex={hasFormAndStep ? 0 : undefined}
                                          onClick={() => {
                                            if (targetUrl) {
                                              navigate(targetUrl);
                                            }
                                          }}
                                          onKeyDown={(event) => {
                                            if (
                                              (event.key === "Enter" ||
                                                event.key === " ") &&
                                              targetUrl
                                            ) {
                                              event.preventDefault();
                                              navigate(targetUrl);
                                            }
                                          }}
                                          key={
                                            observation.id_observacion ||
                                            `${request.idSolicitud}-${observation.observacion}`
                                          }
                                        >
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="flex-start"
                                            sx={{ width: "100%" }}
                                          >
                                            {(() => {
                                              const obsStatus =
                                                getObservationStatusMeta(
                                                  observation.estado,
                                                );
                                              return (
                                                <>
                                                  <Checkbox
                                                    size="small"
                                                    checked={[
                                                      "corregida",
                                                      "subsanada",
                                                    ].includes(obsStatus.key)}
                                                    disabled={
                                                      !isRequestInCorrection(
                                                        request,
                                                      ) ||
                                                      obsStatus.key ===
                                                        "subsanada" ||
                                                      observationActionLoading[
                                                        `${request.idSolicitud}-${observation.id_observacion}`
                                                      ]
                                                    }
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                    onChange={(event) =>
                                                      handleObservationStatus(
                                                        request,
                                                        observation,
                                                        event.target.checked
                                                          ? "corregida"
                                                          : "pendiente",
                                                      )
                                                    }
                                                    inputProps={{
                                                      "aria-label": `Marcar observación como corregida: ${observation.observacion}`,
                                                    }}
                                                  />
                                                  <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                      className={
                                                        hasFormAndStep
                                                          ? "workflow-observation-link"
                                                          : undefined
                                                      }
                                                      variant="body2"
                                                      sx={{
                                                        cursor: hasFormAndStep
                                                          ? "pointer"
                                                          : "default",
                                                        fontWeight:
                                                          hasFormAndStep
                                                            ? 500
                                                            : 400,
                                                        color: hasFormAndStep
                                                          ? "primary.main"
                                                          : "text.primary",
                                                        "&:hover":
                                                          hasFormAndStep
                                                            ? {
                                                                textDecoration:
                                                                  "underline",
                                                              }
                                                            : {},
                                                      }}
                                                    >
                                                      {observation.observacion}
                                                    </Typography>
                                                    <Stack
                                                      direction="row"
                                                      spacing={1}
                                                      alignItems="center"
                                                      flexWrap="wrap"
                                                      sx={{ mt: 0.5 }}
                                                    >
                                                      <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                      >
                                                        {observation.nombre_autor ||
                                                          "Revisión"}
                                                      </Typography>
                                                      <Chip
                                                        size="small"
                                                        label={obsStatus.label}
                                                        color={obsStatus.color}
                                                        variant="outlined"
                                                        sx={{
                                                          height: 20,
                                                          fontSize: "0.7rem",
                                                          fontWeight: 600,
                                                        }}
                                                      />
                                                      {hasFormAndStep && (
                                                        <Chip
                                                          size="small"
                                                          label={`Ir a Formulario ${observation.formulario} · Paso ${observation.paso}`}
                                                          variant="outlined"
                                                          color="primary"
                                                          sx={{
                                                            height: 22,
                                                            fontSize: "0.72rem",
                                                            cursor: "pointer",
                                                          }}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (targetUrl)
                                                              navigate(
                                                                targetUrl,
                                                              );
                                                          }}
                                                        />
                                                      )}
                                                    </Stack>
                                                  </Box>
                                                </>
                                              );
                                            })()}
                                          </Stack>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              {currentStage === 0 && (
                                <Button
                                  sx={{ mt: 1.5 }}
                                  variant="contained"
                                  color="secondary"
                                  onClick={() =>
                                    handleSendSelectedFormsToReview(
                                      request,
                                      true,
                                    )
                                  }
                                  disabled={
                                    !areRequiredFormsComplete(request) ||
                                    pendingObservations.length > 0 ||
                                    Boolean(
                                      bulkReviewLoadingByRequest[
                                        request.idSolicitud
                                      ],
                                    )
                                  }
                                >
                                  {bulkReviewLoadingByRequest[
                                    request.idSolicitud
                                  ]
                                    ? "Enviando..."
                                    : String(
                                          request?.estado_etapa || "",
                                        ).toLowerCase() === "devuelta" ||
                                        String(
                                          request?.estado_etapa || "",
                                        ).toLowerCase() ===
                                          "requiere_correcciones" ||
                                        hasCorrectionsInRequest(request)
                                      ? "Reenviar solicitud a revisión"
                                      : "Enviar formularios a revisión"}
                                </Button>
                              )}
                              {pendingObservations.length > 0 && (
                                <Typography
                                  variant="caption"
                                  color="warning.main"
                                >
                                  Marca como corregidas todas las observaciones
                                  pendientes para habilitar el reenvío.
                                </Typography>
                              )}
                              {!areRequiredFormsComplete(request) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Completa Aprobación y Presupuesto
                                  {riskMatrixRequired
                                    ? " y Matriz de riesgos (total de horas igual o superior a 16)"
                                    : ""}{" "}
                                  para habilitar el envío a revisión.
                                </Typography>
                              )}
                              {renderSignaturePreviewGrid(request)}
                              {currentStage === 3 &&
                                renderWorkflowPanel(request)}
                            </>
                          )}
                        </>
                      ) : index === 3 ? (
                        renderWorkflowPanel(request)
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {stage.content}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        {renderWorkflowHistory(request, "requester")}
      </Box>
    );
  };

  const renderRequesterList = (requests) => (
    <div className="requester-list">
      {requests.map((request) => {
        const waitingCorrections = hasCorrectionsInRequest(request);
        const overallStatus =
          request.estado_general ||
          (waitingCorrections ? "Requiere correcciones" : "En proceso");
        return (
          <Accordion
            className={`requester-request request-status-card--${getRequestVisualStatus(request, userData?.role).tone}`}
            key={`requester-${request.idSolicitud}`}
            disableGutters
            elevation={0}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: "100%", pr: 1 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {request.nombre_actividad || "Solicitud"}
                  </Typography>
                  <span
                    className={`request-status-badge request-status-badge--${getRequestVisualStatus(request, userData?.role).tone}`}
                  >
                    {getRequestDescriptiveStatus(request, userData?.role) ||
                      overallStatus}
                  </span>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {request.fecha_solicitud || "Sin fecha"}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails className="requester-request__body">
              {renderRequesterStages(request)}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );

  const renderWorkflowPanel = (request) => {
    const role = String(userData?.role || "").toLowerCase() || "solicitante";
    const stage = getRequestStage(request);
    const reviewerStage = getReviewerStage(role);
    const observations = filterActiveObservations(
      workflowObservations[request.idSolicitud] || [],
    );
    const canReview = reviewerStage === stage;
    const canAct = request.puede_actuar !== false;
    const requestState = normalizeStatusForMatch(request.estado_etapa);
    const observationsLocked = ["devuelta", "finalizado", "cerrada"].includes(
      requestState,
    );
    const canManageObservation = (observation) =>
      canAct &&
      !observationsLocked &&
      (role === "admin" ||
        (role === "revisor_2" && stage === "revision_2") ||
        String(observation.id_usuario_autor) === String(userData.id) ||
        getReviewerStage(role) === observation.etapa);
    const canLegacyAdminReview =
      role === "admin" &&
      canAct &&
      !["decanato", "firmas", "finalizado"].includes(stage);
    const hasDirectorSignature =
      request.firma_director === true ||
      String(request.firma_director) === "true" ||
      Boolean(request.firma_director_info);
    const hasSolicitanteSignature =
      request.firma_solicitante === true ||
      String(request.firma_solicitante) === "true" ||
      Boolean(request.firma_solicitante_info);
    const hasRegisteredSignature =
      role === "director" ? hasDirectorSignature : hasSolicitanteSignature;
    const isRequesterSigner =
      role === "solicitante" ||
      isOwnRequest(request, userData?.id, userData?.name, userData?.email);
    const canSignAsSolicitante =
      stage === "firmas" &&
      hasDirectorSignature &&
      isRequesterSigner &&
      !hasSolicitanteSignature;
    const signatureStage =
      stage === "firmas" &&
      ((role === "director" && canAct && !hasDirectorSignature) ||
        canSignAsSolicitante);

    return (
      <div className="workflow-panel">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="subtitle2" color="primary">
            Acciones
          </Typography>
        </Stack>
        {request.puede_actuar === false && (
          <Typography variant="caption" color="text.secondary">
            Consulta de solo lectura:{" "}
            {request.motivo_sin_permiso ||
              "no tienes permiso para actuar en esta etapa."}
          </Typography>
        )}

        {(canReview || canLegacyAdminReview || stage === "decanato") && (
          <>
            <Typography variant="caption" color="text.secondary">
              {stage === "decanato"
                ? "El cierre final se registra desde Decanato."
                : `Etapa a cargo de ${reviewerStage || role}.`}
            </Typography>
            {observations.length > 0 && (
              <div className="workflow-observations">
                <Typography variant="body2" fontWeight={600}>
                  Observaciones
                </Typography>
                {observations.map((observation) => {
                  const observationActionKey = `${request.idSolicitud}-${observation.id_observacion}`;
                  const canManage = canManageObservation(observation);
                  const obsStatus = getObservationStatusMeta(
                    observation.estado,
                  );
                  return (
                    <div
                      className="workflow-observation"
                      key={observation.id_observacion}
                    >
                      <div style={{ flex: 1 }}>
                        <Typography variant="body2">
                          {observation.observacion}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          sx={{ mt: 0.5 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {observation.formulario
                              ? `Formulario ${observation.formulario}`
                              : "Etapa"}
                            {observation.paso
                              ? ` · Paso ${observation.paso}`
                              : ""}
                            {observation.nombre_autor
                              ? ` · ${observation.nombre_autor}`
                              : ""}
                          </Typography>
                          <Chip
                            size="small"
                            label={obsStatus.label}
                            color={obsStatus.color}
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          />
                          {observation.formulario && observation.paso && (
                            <Chip
                              size="small"
                              label={`Ver en Formulario ${observation.formulario} · Paso ${observation.paso}`}
                              variant="outlined"
                              color="primary"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const targetStepIndex = Math.max(
                                  0,
                                  parseInt(observation.paso, 10) - 1,
                                );
                                const stageCode =
                                  request.etapa_codigo ||
                                  request.etapa_actual ||
                                  getRequestStage(request) ||
                                  "";
                                navigate(
                                  `/formulario/${observation.formulario}?solicitud=${request.idSolicitud}&paso=${targetStepIndex}&etapa=${encodeURIComponent(stageCode)}&readOnly=1`,
                                );
                              }}
                            />
                          )}
                        </Stack>
                      </div>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {/* Botón de editar observación oculto temporalmente */}
                        {canManage && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              handleDeleteObservation(request, observation)
                            }
                            disabled={
                              observationActionLoading[observationActionKey]
                            }
                          >
                            {observationActionLoading[observationActionKey] ? (
                              <CircularProgress size={16} />
                            ) : (
                              "Desechar"
                            )}
                          </Button>
                        )}
                        {canAct && !observationsLocked && (
                          <>
                            {obsStatus.key !== "subsanada" && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() =>
                                  handleObservationStatus(
                                    request,
                                    observation,
                                    "subsanada",
                                  )
                                }
                                disabled={
                                  observationActionLoading[observationActionKey]
                                }
                              >
                                {observationActionLoading[
                                  observationActionKey
                                ] ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  "Marcar subsanada"
                                )}
                              </Button>
                            )}
                            {/* Botón de marcar como pendiente oculto temporalmente */}
                          </>
                        )}
                      </Stack>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {canReview && canAct && (
          <div className="workflow-decision-actions">
            {/* Comentario general oculto temporalmente. */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {role !== "revisor_1" && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() =>
                    canLegacyAdminReview
                      ? handleLegacyAdminAction(request, "return")
                      : handleWorkflowReviewerAction(request, "return")
                  }
                  disabled={Boolean(reviewAction[request.idSolicitud])}
                >
                  Devolver
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  canLegacyAdminReview
                    ? handleLegacyAdminAction(request, "approve")
                    : role === "presupuesto"
                      ? handleOpenSendToDecanato(request)
                      : handleWorkflowReviewerAction(request, "approve")
                }
                disabled={Boolean(reviewAction[request.idSolicitud])}
              >
                {role === "revisor_1"
                  ? "Enviar a Revisión 2"
                  : role === "revisor_2"
                    ? "Aprobar y continuar proceso"
                    : role === "presupuesto"
                      ? "Aprobar y continuar proceso"
                      : "Aprobar etapa"}
              </Button>
            </Stack>
          </div>
        )}

        {signatureStage && (
          <div className="workflow-signature">
            <Typography variant="body2" fontWeight={600}>
              Registrar firma
            </Typography>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setSignatureFiles((previous) => ({
                  ...previous,
                  [request.idSolicitud]: event.target.files?.[0],
                }))
              }
            />
            <textarea
              placeholder="Observaciones de la firma (opcional)"
              value={signatureNotes[request.idSolicitud] || ""}
              onChange={(event) =>
                setSignatureNotes((previous) => ({
                  ...previous,
                  [request.idSolicitud]: event.target.value,
                }))
              }
            />
            <Button
              variant="contained"
              onClick={() => {
                if (role === "director") {
                  if (!signatureFiles[request.idSolicitud]) {
                    alert("Selecciona la imagen de la firma.");
                    return;
                  }
                  setConfirmDirectorSignatureRequest(request);
                  return;
                }
                handleWorkflowSignature(request);
              }}
              disabled={
                observationActionLoading[`${request.idSolicitud}-signature`]
              }
            >
              {observationActionLoading[`${request.idSolicitud}-signature`] ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 0.5 }} />
                  Cargando...
                </>
              ) : (
                "Registrar firma"
              )}
            </Button>
            {/* Botón de recordatorio de firma oculto temporalmente
            <Button
              variant="outlined"
              onClick={() =>
                handleSignatureReminder(
                  request,
                  role === "director" ? "solicitante" : "director_escuela",
                )
              }
            >
              Recordar firma pendiente
            </Button>
            */}
          </div>
        )}

        {stage === "firmas" &&
          role === "director" &&
          hasRegisteredSignature && (
            <Box className="workflow-signature-confirmation">
              <Typography variant="body2" fontWeight={600}>
                Firma agregada correctamente.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Extensión enviará la solicitud a Presupuesto cuando estén
                registradas ambas firmas.
              </Typography>
            </Box>
          )}

        {stage === "firmas" &&
          role !== "director" &&
          isRequesterSigner &&
          !hasDirectorSignature && (
            <Box
              className="workflow-signature-confirmation"
              sx={{
                mt: 1.5,
                p: 2,
                borderRadius: 1,
                backgroundColor: "#fff8e1",
                border: "1px solid #ffe082",
                color: "#8a6200",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Pendiente firma del Director de Escuela.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Primero debe firmar el director de escuela. Una vez registre su
                firma, se habilitará la carga de tu firma como solicitante.
              </Typography>
            </Box>
          )}

        {stage === "firmas" &&
          role !== "director" &&
          isRequesterSigner &&
          hasRegisteredSignature && (
            <Box
              className="workflow-signature-confirmation"
              sx={{
                mt: 1.5,
                p: 2,
                borderRadius: 1,
                backgroundColor: "#e8f5e9",
                border: "1px solid #a5d6a7",
              }}
            >
              <Typography variant="body2" fontWeight={600} color="#2e7d32">
                ✓ Tu firma como solicitante ya fue registrada correctamente.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {request.firma_director
                  ? "La solicitud ya cuenta con ambas firmas y está lista para ser remitida a Presupuesto."
                  : "La solicitud está a la espera de la firma del director de escuela."}
              </Typography>
            </Box>
          )}

        {isDecanatoCloser(request) && (
          <div className="workflow-decanato">
            <Typography variant="body2" fontWeight={600}>
              Cierre de Decanato
            </Typography>
            <label htmlFor={`decanato-result-${request.idSolicitud}`}>
              Resultado
            </label>
            <select
              id={`decanato-result-${request.idSolicitud}`}
              className="workflow-decanato__select"
              value={decanatoData[request.idSolicitud]?.resultado || "Aprobada"}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    resultado: event.target.value,
                  },
                }))
              }
            >
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
            <label htmlFor={`decanato-resolution-${request.idSolicitud}`}>
              Nombre o número de resolución *
            </label>
            <input
              id={`decanato-resolution-${request.idSolicitud}`}
              type="text"
              placeholder="Resolución"
              value={decanatoData[request.idSolicitud]?.resolucion || ""}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    resolucion: event.target.value,
                  },
                }))
              }
            />
            <label htmlFor={`decanato-pdf-${request.idSolicitud}`}>
              PDF de resolución (opcional)
            </label>
            <input
              id={`decanato-pdf-${request.idSolicitud}`}
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    pdf: event.target.files?.[0],
                  },
                }))
              }
            />
            <label htmlFor={`decanato-notes-${request.idSolicitud}`}>
              Observaciones
            </label>
            <textarea
              id={`decanato-notes-${request.idSolicitud}`}
              placeholder="Observaciones del cierre (opcional)"
              value={decanatoData[request.idSolicitud]?.observaciones || ""}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    observaciones: event.target.value,
                  },
                }))
              }
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => handleDecanatoClosure(request)}
            >
              Cerrar solicitud
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderReceivedForms = (request) => {
    const submittedForms = [1, 2, 3, 4].filter((formNumber) => {
      const status = normalizeStatusForMatch(
        resolveFormStatus(request, formNumber),
      );
      return (
        status &&
        !["en progreso", "pendiente", "borrador", "no iniciado"].includes(
          status,
        )
      );
    });

    if (!submittedForms.length) return null;

    return (
      <Box className="workflow-stage-content">
        <Typography variant="subtitle2" color="primary">
          Formularios diligenciados
        </Typography>
        <Stack className="requester-forms" spacing={1}>
          {submittedForms.map((formNumber) => {
            const formStatus = resolveFormStatus(request, formNumber);
            const { formEnabled, reportEnabled, formColor } = getButtonState(
              request,
              formNumber,
              { isReceived: true },
            );
            return (
              <Box
                className="requester-form"
                key={`${request.idSolicitud}-received-form-${formNumber}`}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {formNames[formNumber - 1]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formStatus}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  className="requester-form__actions"
                >
                  {isAtOrPastFirmas(request) ? (
                    renderPdfDownloadButton(request, formNumber)
                  ) : (
                    <>
                      <Tooltip title="Abrir formulario">
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            aria-label="Abrir formulario"
                            style={{ backgroundColor: formColor }}
                            onClick={() =>
                              handleNavigateToForm(request, formNumber, true)
                            }
                            disabled={!formEnabled}
                          >
                            <VisibilityOutlined fontSize="small" />
                          </Button>
                        </span>
                      </Tooltip>
                      {reportEnabled && (
                        <Tooltip title="Descargar">
                          <Button
                            size="small"
                            variant="outlined"
                            aria-label="Descargar formulario"
                            onClick={() =>
                              handleDownloadFormReport(request, formNumber)
                            }
                          >
                            <DownloadOutlined fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
        {renderSignaturePreviewGrid(request)}
      </Box>
    );
  };

  const renderReceivedStageContent = (
    request,
    stageIndex,
    current,
    isFocusedReceivedStage = false,
  ) => {
    if (stageIndex !== current && !isFocusedReceivedStage) return null;

    if (stageIndex === 6) {
      const result = getDecanatoResult(request);
      const resolution = getDecanatoResolution(request);
      const resolutionFile = getDecanatoResolutionFile(request);
      const finalizationDetails = [
        result && `Resultado: ${result} `,
        resolution && ` Resolución: ${resolution} `,
        resolutionFile && (
          <a href={resolutionFile} target="_blank" rel="noreferrer">
            {"  " + "ver PDF"}
          </a>
        ),
      ].filter(Boolean);
      return (
        <Box className="workflow-final-result">
          <Typography variant="body1" fontWeight={700}>
            La solicitud ya finalizó.
          </Typography>
          {finalizationDetails.length > 0 && (
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                whiteSpace: "nowrap",
                overflowX: "auto",
              }}
            >
              {finalizationDetails.map((detail, index) => (
                <span key={index}>
                  {index > 0 && <span>-</span>}
                  {detail}
                </span>
              ))}
            </Typography>
          )}
          {renderReceivedForms(request)}
          {!result && !resolution && (
            <Typography variant="body2" color="text.secondary">
              El backend no devolvió todavía los datos del cierre de Decanato.
            </Typography>
          )}
          {renderWorkflowHistory(request, "final")}
        </Box>
      );
    }

    if (
      stageIndex === 3 &&
      request.firmas_completas &&
      ["revisor_1", "revisor_2", "admin"].includes(
        String(userData?.role || "").toLowerCase(),
      )
    ) {
      return (
        <Box className="workflow-stage-content">
          <Box className="workflow-send-presupuesto">
            <Typography variant="body2" color="text.secondary">
              La solicitud ya cuenta con las firmas del solicitante y del
              director.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleSendToPresupuesto(request)}
              disabled={sendingPresupuestoId === request.idSolicitud}
            >
              {sendingPresupuestoId === request.idSolicitud
                ? "Enviando a Presupuesto..."
                : "Enviar a Presupuesto"}
            </Button>
          </Box>
          {renderReceivedForms(request)}
          {renderWorkflowHistory(request, "signatures")}
        </Box>
      );
    }

    return (
      <Box className="workflow-stage-content">
        {renderReceivedForms(request)}
        {String(userData?.role || "").toLowerCase() === "admin" ||
        getReviewerStage(userData?.role) === getRequestStage(request) ||
        isDecanatoCloser(request) ||
        String(userData?.role || "").toLowerCase() === "director" ||
        (String(userData?.role || "").toLowerCase() === "solicitante" &&
          getRequestStage(request) === "firmas") ||
        (["revisor_1", "revisor_2"].includes(
          String(userData?.role || "").toLowerCase(),
        ) &&
          (String(request.estado_etapa || "").toLowerCase() === "devuelta" ||
            getRequestStage(request) === "solicitud"))
          ? renderWorkflowPanel(request)
          : null}
        {renderWorkflowHistory(request, "stage")}
      </Box>
    );
  };

  const renderRequestList = ({
    requests,
    readOnlyMode = false,
    isReceived = false,
  }) => {
    if (!isReceived && !isAdmin) return renderRequesterList(requests);
    const stageIndexes = {
      solicitud: 0,
      revision_1: 1,
      revision_2: 2,
      firmas: 3,
      presupuesto: 4,
      decanato: 5,
      finalizado: 6,
    };
    const role = String(userData?.role || "").toLowerCase();
    const specialGroups =
      isReceived && role === "presupuesto"
        ? [
            {
              name: "Por revisar",
              stageIndex: "presupuesto-pendientes",
              requests: requests.filter(
                (request) => getRequestStage(request) === "presupuesto",
              ),
            },
            {
              name: "Ya revisadas",
              stageIndex: "presupuesto-revisadas",
              requests: requests.filter(
                (request) => getRequestStage(request) !== "presupuesto",
              ),
            },
          ]
        : isReceived && role === "director"
          ? [
              {
                name: "Por firmar",
                stageIndex: "director-pendientes",
                requests: requests.filter(
                  (request) =>
                    getRequestStage(request) === "firmas" &&
                    !request.firma_director,
                ),
              },
              {
                name: "Ya firmadas",
                stageIndex: "director-firmadas",
                requests: requests.filter(
                  (request) =>
                    getRequestStage(request) !== "firmas" ||
                    Boolean(request.firma_director),
                ),
              },
            ]
          : null;

    const groupedByStage = requests.reduce((groups, request) => {
      const explicitStage = getRequestStage(request);
      const stageIndex = stageIndexes[explicitStage] ?? getFlowIndex(request);
      if (!groups[stageIndex]) groups[stageIndex] = [];
      groups[stageIndex].push(request);
      return groups;
    }, {});
    const visibleStageIndexes =
      role === "decanato"
        ? [stageIndexes.decanato]
        : flowStages
            .map((_, index) => index)
            .filter(
              (index) =>
                !(
                  isReceived &&
                  ["revisor_1", "revisor_2"].includes(role) &&
                  index === stageIndexes.solicitud
                ),
            );
    const isSubsanarRequest = (request) => {
      const stage = getRequestStage(request);
      const stageState = String(request?.estado_etapa || "")
        .trim()
        .toLowerCase();
      const formState = String(request?.estado_formulario || "")
        .trim()
        .toLowerCase();
      const visualStatus = getRequestVisualStatus(request);
      return (
        (stage === "solicitud" ||
          String(request?.etapa_codigo || "").toLowerCase() === "solicitud") &&
        (stageState === "devuelta" ||
          stageState === "requiere_correcciones" ||
          formState === "requiere correcciones" ||
          visualStatus.tone === "correction" ||
          hasCorrectionsInRequest(request))
      );
    };

    const subsanarRequests =
      isReceived && ["revisor_1", "revisor_2"].includes(role)
        ? requests.filter(isSubsanarRequest)
        : [];

    const groupedRequests =
      specialGroups ||
      (() => {
        const baseGroups = visibleStageIndexes
          .map((stageIndex) => flowStages[stageIndex])
          .map(([name], stageIndex) => ({
            name,
            stageIndex: visibleStageIndexes[stageIndex],
            requests: groupedByStage[visibleStageIndexes[stageIndex]] || [],
          }));

        if (subsanarRequests.length > 0) {
          return [
            {
              name: "Enviada a subsanar",
              stageIndex: "enviada-a-subsanar",
              requests: subsanarRequests,
            },
            ...baseGroups,
          ];
        }
        return baseGroups;
      })();

    return (
      <div className="approval-list">
        {groupedRequests.map((group) => (
          <Accordion
            key={`stage-group-${group.stageIndex}`}
            className="workflow-stage-group"
            disableGutters
            defaultExpanded={group === groupedRequests[0]}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: "100%", pr: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {group.name}
                </Typography>
                <Typography className="workflow-stage-count" variant="body2">
                  {group.requests.length}{" "}
                  {group.requests.length === 1 ? "solicitud" : "solicitudes"}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails className="workflow-stage-group__details">
              {group.requests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay solicitudes en esta etapa.
                </Typography>
              ) : (
                group.requests.map((request) => (
                  <Accordion
                    key={`${readOnlyMode ? "readonly" : "own"}-${request.idSolicitud}`}
                    className={`approval-card request-status-card--${getRequestVisualStatus(request, userData?.role).tone}`}
                    disableGutters
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ width: "100%", pr: 1 }}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {request.nombre_actividad || "Solicitud"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.fecha_solicitud || "Sin fecha"}
                            </Typography>
                          </Box>
                          <span
                            className={`request-status-badge request-status-badge--${getRequestVisualStatus(request, userData?.role).tone}`}
                          >
                            {getRequestDescriptiveStatus(
                              request,
                              userData?.role,
                            )}
                          </span>
                        </Stack>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails className="approval-card__details">
                      {(() => {
                        const titleText = isReceived
                          ? `Solicitante: ${request.nombre_solicitante || "Usuario sin nombre"}`
                          : request.nombre_actividad || "Solicitud";

                        const current = getFlowIndex(request);
                        const isSubsanarGroup =
                          group.stageIndex === "enviada-a-subsanar";
                        const timelineIndexes = isReceived
                          ? [
                              role === "presupuesto"
                                ? 4
                                : role === "director"
                                  ? 3
                                  : specialGroups
                                    ? group.stageIndex
                                    : isSubsanarGroup
                                      ? 0
                                      : current,
                            ]
                          : flowStages.map((_, index) => index);
                        const visibleTimelineIndexes = timelineIndexes.filter(
                          (index) =>
                            !(
                              isReceived &&
                              ["revisor_1", "revisor_2"].includes(role) &&
                              index === 0 &&
                              !isSubsanarGroup
                            ),
                        );
                        return (
                          <>
                            <div className="approval-card__header">
                              <div>
                                <Typography variant="h6">
                                  {titleText}
                                </Typography>
                                {isReceived && request.nombre_dependencia && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Dependencia: {request.nombre_dependencia}
                                  </Typography>
                                )}
                              </div>
                            </div>
                            <div className="flow-track flow-track--static">
                              {visibleTimelineIndexes.map((index) => {
                                const [name] = flowStages[index];
                                const isFocusedReceivedStage =
                                  isReceived && index !== current;
                                return (
                                  <div
                                    className={`flow-step ${index < current ? "done" : index === current ? "current" : ""}`}
                                    key={name}
                                  >
                                    <div className="flow-step__details">
                                      {renderReceivedStageContent(
                                        request,
                                        index,
                                        current,
                                        isFocusedReceivedStage,
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}

                      {!isReceived && (
                        <>
                          <Stack
                            className="requester-forms"
                            spacing={1}
                            sx={{ mt: 2 }}
                          >
                            {[1, 2, 3, 4].map((formNumber) => {
                              const formStatus =
                                resolveFormStatus(request, formNumber) ||
                                "En progreso";
                              const {
                                formEnabled,
                                reportEnabled,
                                formColor,
                                reportColor,
                              } = getButtonState(request, formNumber, {
                                isReceived,
                              });
                              const shouldReadOnly =
                                isReceived ||
                                (!isAdmin && isLockedForOwner(formStatus));

                              if (readOnlyMode) {
                                return (
                                  <Box
                                    className="requester-form"
                                    key={`view-${request.idSolicitud}-${formNumber}`}
                                  >
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                      >
                                        {formNames[formNumber - 1]}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {formStatus}
                                      </Typography>
                                    </Box>
                                    <Tooltip title="Abrir formulario">
                                      <span>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          aria-label="Abrir formulario"
                                          onClick={() =>
                                            handleNavigateToForm(
                                              request,
                                              formNumber,
                                              true,
                                            )
                                          }
                                        >
                                          <VisibilityOutlined fontSize="small" />
                                        </Button>
                                      </span>
                                    </Tooltip>
                                  </Box>
                                );
                              }

                              const canSelectForReview =
                                !readOnlyMode &&
                                !isReceived &&
                                !isAdmin &&
                                isFormSelectableForReview(request, formNumber);
                              const isSelected = Boolean(
                                selectedFormsByRequest[request.idSolicitud]?.[
                                  formNumber
                                ],
                              );

                              return (
                                <Box
                                  className="requester-form"
                                  key={`container-${request.idSolicitud}-${formNumber}`}
                                >
                                  {!readOnlyMode && !isReceived && !isAdmin && (
                                    <Checkbox
                                      size="small"
                                      checked={isSelected}
                                      onChange={() =>
                                        toggleFormSelection(
                                          request.idSolicitud,
                                          formNumber,
                                        )
                                      }
                                      disabled={
                                        !canSelectForReview ||
                                        bulkReviewLoadingByRequest[
                                          request.idSolicitud
                                        ]
                                      }
                                      sx={{ p: 0.5 }}
                                    />
                                  )}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {formNames[formNumber - 1]}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formStatus}
                                    </Typography>
                                  </Box>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    className="requester-form__actions"
                                  >
                                    {isAtOrPastFirmas(request) ? (
                                      renderPdfDownloadButton(
                                        request,
                                        formNumber,
                                      )
                                    ) : (
                                      <>
                                        <Tooltip title="Abrir formulario">
                                          <span>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              aria-label="Abrir formulario"
                                              style={{
                                                backgroundColor: formColor,
                                                cursor: formEnabled
                                                  ? "pointer"
                                                  : "not-allowed",
                                              }}
                                              onClick={() =>
                                                handleNavigateToForm(
                                                  request,
                                                  formNumber,
                                                  shouldReadOnly,
                                                )
                                              }
                                              disabled={!formEnabled}
                                            >
                                              <VisibilityOutlined fontSize="small" />
                                            </Button>
                                          </span>
                                        </Tooltip>

                                        {reportEnabled ? (
                                          <Tooltip
                                            title={
                                              String(
                                                userData?.role || "",
                                              ).toLowerCase() === "solicitante"
                                                ? "Generar reporte"
                                                : "Descargar"
                                            }
                                          >
                                            <span>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                style={{
                                                  cursor: loadingReports[
                                                    `${request.idSolicitud}-${formNumber}`
                                                  ]
                                                    ? "wait"
                                                    : "pointer",
                                                }}
                                                onClick={() =>
                                                  handleDownloadFormReport(
                                                    request,
                                                    formNumber,
                                                  )
                                                }
                                                disabled={
                                                  loadingReports[
                                                    `${request.idSolicitud}-${formNumber}`
                                                  ]
                                                }
                                              >
                                                {loadingReports[
                                                  `${request.idSolicitud}-${formNumber}`
                                                ] ? (
                                                  <>
                                                    <CircularProgress
                                                      size={16}
                                                      color="inherit"
                                                      sx={{ mr: 0.5 }}
                                                    />
                                                    Cargando...
                                                  </>
                                                ) : (
                                                  <DownloadOutlined fontSize="small" />
                                                )}
                                              </Button>
                                            </span>
                                          </Tooltip>
                                        ) : (
                                          <Tooltip title="Formulario no completado">
                                            <span>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                style={{
                                                  backgroundColor: reportColor,
                                                  cursor: "not-allowed",
                                                }}
                                                disabled
                                              >
                                                <DownloadOutlined fontSize="small" />
                                              </Button>
                                            </span>
                                          </Tooltip>
                                        )}
                                      </>
                                    )}
                                  </Stack>
                                  {renderWorkflowHistory(
                                    request,
                                    `received-form-${formNumber}`,
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>

                          {!readOnlyMode && !isReceived && !isAdmin && (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() =>
                                handleSendSelectedFormsToReview(request)
                              }
                              disabled={Boolean(
                                bulkReviewLoadingByRequest[request.idSolicitud],
                              )}
                              style={{
                                minWidth: "190px",
                                justifySelf: "start",
                              }}
                            >
                              {bulkReviewLoadingByRequest[request.idSolicitud]
                                ? "Enviando..."
                                : "Enviar seleccionados a revision"}
                            </Button>
                          )}
                          {isReceived &&
                            (String(userData?.role || "").toLowerCase() ===
                              "admin" ||
                            getReviewerStage(userData?.role) ===
                              getRequestStage(request) ||
                            isDecanatoCloser(request) ||
                            String(userData?.role || "").toLowerCase() ===
                              "director" ||
                            (String(userData?.role || "").toLowerCase() ===
                              "solicitante" &&
                              getRequestStage(request) === "firmas")
                              ? renderWorkflowPanel(request)
                              : null)}
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "20px", marginTop: "0", width: "100%", boxSizing: "border-box" }}>
        <WorkflowRoleView
          role={userData.role}
          ownRequests={ownRequests}
          receivedRequests={receivedRequests}
          onCreateRequest={handleCreateNewRequest}
          renderOwnRequests={(requests) =>
            renderRequestList({ requests, readOnlyMode: false })
          }
          renderReceivedRequests={(requests) =>
            renderRequestList({
              requests,
              readOnlyMode: false,
              isReceived: true,
            })
          }
        />
        <Dialog
          open={Boolean(sendDecanatoRequest)}
          onClose={() => !sendingDecanato && setSendDecanatoRequest(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Enviar solicitud a Decanato</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Los usuarios con rol Decanato recibirán el correo con los
              formularios firmados en PDF. Puedes agregar destinatarios
              adicionales y revisar o editar el texto de la plantilla antes de
              enviar.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Destinatarios adicionales"
                placeholder="persona@ejemplo.edu.co, coordinador@ejemplo.edu.co"
                helperText="Sepáralos por coma, punto y coma o salto de línea."
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]
                    ?.destinatarios || ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      destinatarios: event.target.value,
                    },
                  }))
                }
                fullWidth
              />
              <TextField
                label="Asunto del correo"
                placeholder={`[Extensión] Solicitud #${sendDecanatoRequest?.idSolicitud || ""} aprobada en Presupuesto y remitida a Decanato - ${sendDecanatoRequest?.nombreActividad || ""}`}
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]?.asunto ||
                  ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      asunto: event.target.value,
                    },
                  }))
                }
                fullWidth
              />
              <TextField
                label="Mensaje o cuerpo del correo"
                placeholder="Texto institucional del correo para Decanato..."
                helperText="Este es el texto de la plantilla que se enviará en el correo; puedes editarlo si lo deseas. Los formularios firmados en PDF se adjuntarán automáticamente."
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]?.cuerpo ||
                  ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      cuerpo: event.target.value,
                    },
                  }))
                }
                multiline
                minRows={6}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSendDecanatoRequest(null)}
              disabled={sendingDecanato}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSendToDecanato}
              disabled={sendingDecanato}
            >
              {sendingDecanato ? "Enviando..." : "Enviar a Decanato"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(confirmDirectorSignatureRequest)}
          onClose={() => setConfirmDirectorSignatureRequest(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirmar firma de Director</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2">
              ¿Estás seguro de que la solicitud cumple con todo lo requerido
              para registrar tu firma?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDirectorSignatureRequest(null)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const targetRequest = confirmDirectorSignatureRequest;
                setConfirmDirectorSignatureRequest(null);
                if (targetRequest) {
                  handleWorkflowSignature(targetRequest);
                }
              }}
            >
              Confirmar y firmar
            </Button>
          </DialogActions>
        </Dialog>
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
